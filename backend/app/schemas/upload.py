from pydantic import BaseModel


class UploadResponse(BaseModel):
    report_id: str
    status: str
    processing_step: int


class ReportStatusResponse(BaseModel):
    report_id: str
    status: str
    processing_step: int
    processing_label: str
