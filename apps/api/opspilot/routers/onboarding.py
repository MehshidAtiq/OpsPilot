from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_company, get_current_user
from ..models import Company, User
from ..schemas.company import CompanyResponse, OnboardingRequest
from ..services.audit import write_audit_log

router = APIRouter(tags=["onboarding"])


@router.get("/companies/me", response_model=CompanyResponse)
async def get_company(company: Company = Depends(get_current_company)) -> CompanyResponse:
    return CompanyResponse.model_validate(company)


@router.post("/onboarding", response_model=CompanyResponse)
async def submit_onboarding(
    payload: OnboardingRequest,
    session: AsyncSession = Depends(get_session),
    company: Company = Depends(get_current_company),
    user: User = Depends(get_current_user),
) -> CompanyResponse:
    company.name = payload.company_name
    company.industry = payload.industry
    company.services = payload.services
    company.target_clients = payload.target_clients
    company.primary_language = payload.primary_language
    company.default_formality = payload.default_formality
    company.tone_profile = {"summary": payload.tone_summary}
    company.settings = payload.settings
    await write_audit_log(
        session,
        company_id=company.id,
        user_id=user.id,
        action="company_onboarded",
        entity_type="company",
        entity_id=str(company.id),
        metadata={"services": len(payload.services)},
    )
    await session.commit()
    await session.refresh(company)
    return CompanyResponse.model_validate(company)

