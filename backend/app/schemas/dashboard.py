from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_reports: int
    processed_reports: int
    failed_reports: int
    avg_compliance: float
    high_risk_reports: int
