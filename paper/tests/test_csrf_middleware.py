import importlib
import os
import unittest

from fastapi import Request


class CSRFMiddlewareTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure tests run under strict-token CSRF behavior.
        os.environ["AUTH_CSRF_ENFORCEMENT_ENABLED"] = "true"
        os.environ["AUTH_CSRF_STRICT_MODE"] = "true"

        import main  # noqa: WPS433

        cls.main = importlib.reload(main)
        cls.access_cookie = cls.main.AUTH_ACCESS_COOKIE_NAME
        cls.csrf_cookie = cls.main.AUTH_CSRF_COOKIE_NAME
        cls.csrf_header = cls.main.AUTH_CSRF_HEADER_NAME

    def _probe(self, *, headers=None, cookies=None):
        merged_headers = {k.lower(): str(v) for k, v in (headers or {}).items()}
        if cookies:
            merged_headers["cookie"] = "; ".join(f"{k}={v}" for k, v in cookies.items())

        scope = {
            "type": "http",
            "http_version": "1.1",
            "method": "POST",
            "scheme": "https",
            "path": "/api/protected-action",
            "raw_path": b"/api/protected-action",
            "query_string": b"",
            "headers": [(k.encode("latin-1"), v.encode("latin-1")) for k, v in merged_headers.items()],
            "client": ("127.0.0.1", 12345),
            "server": ("paperx.tech", 443),
        }
        req = Request(scope)
        return self.main._enforce_csrf_for_request(req)

    def test_cookie_only_fails(self):
        response = self._probe(cookies={
            self.access_cookie: "fake-access-token",
            self.csrf_cookie: "token-123",
        })
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 403)

    def test_header_cookie_match_passes_csrf_gate(self):
        token = "token-123"
        response = self._probe(
            headers={self.csrf_header: token},
            cookies={
                self.access_cookie: "fake-access-token",
                self.csrf_cookie: token,
            },
        )
        self.assertIsNone(response)

    def test_cross_origin_without_token_fails(self):
        response = self._probe(
            headers={"Origin": "https://evil.example"},
            cookies={
                self.access_cookie: "fake-access-token",
                self.csrf_cookie: "token-123",
            },
        )
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
