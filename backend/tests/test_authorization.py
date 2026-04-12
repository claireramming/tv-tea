import pytest
import json
import base64
from backend.authorization import jwt_get_username_from_payload_handler, jwt_decode_token


def make_jwt_segment(data: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(data).encode()).rstrip(b"=").decode()


@pytest.mark.django_db
def test_username_handler__replaces_pipe_with_dot():
    payload = {"sub": "auth0|abc123"}
    assert jwt_get_username_from_payload_handler(payload) == "auth0.abc123"


@pytest.mark.django_db
def test_username_handler__handles_multiple_pipes():
    payload = {"sub": "auth0|org|abc"}
    assert jwt_get_username_from_payload_handler(payload) == "auth0.org.abc"


def test_decode_token__raises_when_no_matching_kid(mocker):
    mocker.patch(
        "backend.authorization.requests.get",
        return_value=mocker.Mock(
            json=lambda: {"keys": [{"kid": "wrong-kid", "kty": "RSA"}]}
        ),
    )
    # Build a token with valid base64 segments so jwt.get_unverified_header succeeds
    header = make_jwt_segment({"alg": "RS256", "kid": "real-kid"})
    payload = make_jwt_segment({"sub": "test"})
    fake_token = f"{header}.{payload}.invalidsignature"

    with pytest.raises(Exception, match="Public key not found"):
        jwt_decode_token(fake_token)
