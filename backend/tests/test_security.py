from app.core.security import create_access_token, decode_token


def test_access_token_roundtrip() -> None:
    token = create_access_token("user-123")
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"
