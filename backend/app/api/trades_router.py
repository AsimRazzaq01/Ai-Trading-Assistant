from fastapi import APIRouter

router = APIRouter(prefix="/trades", tags=["trades"])


@router.get("")
def list_trades():
    # Placeholder route (requires auth later)
    return []
