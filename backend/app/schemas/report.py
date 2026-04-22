from datetime import date

from pydantic import BaseModel


class FindingResponse(BaseModel):
    id: str
    title: str
    severity: str
    category: str
    description: str
    recommendation: str

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    id: str
    title: str
    priority: str
    description: str
    owner: str
    due: str

    class Config:
        from_attributes = True


class ReportListItemResponse(BaseModel):
    id: str
    title: str
    audit_type: str
    uploaded_at: date
    file_size: str
    file_type: str
    compliance: int
    risk: str
    status: str

    class Config:
        from_attributes = True


class ReportsListResponse(BaseModel):
    items: list[ReportListItemResponse]
    total: int
    page: int
    page_size: int


class ReportDetailResponse(BaseModel):
    id: str
    title: str
    audit_type: str
    uploaded_at: date
    file_size: str
    file_type: str
    compliance: int
    risk: str
    status: str
    summary: str
    findings: list[FindingResponse]
    recommendations: list[RecommendationResponse]
    trend: list[dict]
    categories: list[dict]
    severity: list[dict]
    heatmap: list[dict]
