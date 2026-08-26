import html as html_lib
import io
import logging
import re
from pathlib import Path

import bleach
import mammoth
import markdown
from django.core.exceptions import ValidationError
from django.db import transaction

from documents.models import DEFAULT_TITLE, Document, DocumentShare

logger = logging.getLogger(__name__)

# Mirrors the node/mark set the Tiptap editor is configured with. Anything the
# editor cannot produce is stripped rather than stored.
ALLOWED_TAGS = [
    "p", "br", "strong", "em", "u", "s", "code", "pre", "blockquote",
    "h1", "h2", "h3", "ul", "ol", "li",
]
ALLOWED_ATTRIBUTES = {}

SUPPORTED_IMPORT_EXTENSIONS = {".txt", ".md", ".docx"}
SUPPORTED_IMPORT_LABEL = ".txt, .md and .docx"
MAX_IMPORT_BYTES = 1024 * 1024


# bleach strips disallowed tags but keeps their text, which would leave inert
# script bodies visible as document text. Dropping them wholesale first is
# cosmetic only — bleach below remains the actual security boundary.
_DROP_WITH_CONTENT = re.compile(
    r"<(script|style)\b[^>]*>.*?</\1\s*>|<(script|style)\b[^>]*/?>",
    re.IGNORECASE | re.DOTALL,
)


def sanitize_document_html(value):
    """Strip anything outside the editor's supported tag set (XSS boundary)."""
    if not value:
        return ""
    return bleach.clean(
        _DROP_WITH_CONTENT.sub("", value),
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True,
    )


def _plain_text_to_html(text):
    blocks = [block for block in text.replace("\r\n", "\n").split("\n\n") if block.strip()]
    if not blocks:
        return ""
    return "".join(
        "<p>{}</p>".format(html_lib.escape(block.strip()).replace("\n", "<br>"))
        for block in blocks
    )


def _read(uploaded_file):
    raw = uploaded_file.read()
    if len(raw) > MAX_IMPORT_BYTES:
        raise ValidationError(
            f"File is too large. Maximum size is {MAX_IMPORT_BYTES // 1024}KB."
        )
    return raw


def _decode_text(raw):
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValidationError("File must be valid UTF-8 text.") from exc


# The editor only supports three heading levels. Without this, deeper Word
# headings would be stripped to loose unstyled text instead of degrading.
_DEEP_HEADINGS = re.compile(r"<(/?)h[4-6]\b([^>]*)>", re.IGNORECASE)


def _docx_to_html(raw):
    """Convert a .docx to semantic HTML (headings, bold/italic, lists).

    Mammoth also emits tables, links and base64 images; those fall outside the
    editor's tag set and are dropped by the sanitizer downstream.
    """
    try:
        html = mammoth.convert_to_html(io.BytesIO(raw)).value
    except Exception as exc:
        logger.warning("Failed to convert .docx upload: %s", exc)
        raise ValidationError(
            "That .docx file could not be read. It may be corrupted or password protected."
        ) from exc
    return _DEEP_HEADINGS.sub(r"<\g<1>h3\g<2>>", html)


def build_document_from_upload(owner, uploaded_file):
    """Convert a .txt/.md/.docx upload into a new document owned by `owner`."""
    suffix = Path(uploaded_file.name).suffix.lower()
    if suffix not in SUPPORTED_IMPORT_EXTENSIONS:
        raise ValidationError(
            f"Unsupported file type. Only {SUPPORTED_IMPORT_LABEL} files can be imported."
        )

    raw = _read(uploaded_file)
    if suffix == ".docx":
        raw_html = _docx_to_html(raw)
    elif suffix == ".md":
        raw_html = markdown.markdown(_decode_text(raw), extensions=["extra", "sane_lists"])
    else:
        raw_html = _plain_text_to_html(_decode_text(raw))

    title = Path(uploaded_file.name).stem or DEFAULT_TITLE
    document = Document.objects.create(
        owner=owner,
        title=title[:255],
        content=sanitize_document_html(raw_html),
    )
    logger.info("Imported document %s for user %s", document.pk, owner.pk)
    return document


@transaction.atomic
def grant_share(document, shared_with_id, permission):
    """Share a document with a user, updating the permission if already shared."""
    if shared_with_id == document.owner_id:
        raise ValidationError("This user already owns the document.")

    share, created = DocumentShare.objects.update_or_create(
        document=document,
        shared_with_id=shared_with_id,
        defaults={"permission": permission},
    )
    logger.info(
        "%s share on document %s for user %s",
        "Created" if created else "Updated",
        document.pk,
        shared_with_id,
    )
    return share
