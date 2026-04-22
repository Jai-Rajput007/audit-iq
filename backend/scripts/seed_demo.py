from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import Organization, User


def run() -> None:
    db = SessionLocal()
    try:
        org_slug = "auditsummar-demo"
        org = db.scalar(select(Organization).where(Organization.slug == org_slug))
        if org is None:
            org = Organization(name="AuditSummar Demo", slug=org_slug)
            db.add(org)
            db.flush()

        email = "demo@auditsummar.ai"
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(
                email=email,
                full_name="Demo Admin",
                password_hash=get_password_hash("demo1234"),
                role="Admin",
                organization_id=org.id,
                is_active=True,
            )
            db.add(user)
            db.commit()
            print("Seeded demo user: demo@auditsummar.ai / demo1234")
        else:
            print("Demo user already exists.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
