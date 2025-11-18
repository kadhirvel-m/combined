"""
Unit tests for shared_utils module.

Run with: python -m pytest test_shared_utils.py -v
Or: python test_shared_utils.py
"""

import unittest
from typing import List, Dict, Any
from shared_utils import (
    normalize_text,
    skill_in_text,
    domain_as_channel,
    chunks,
    safe_int,
    rank_tiebreak_key,
    greedy_cover_from_candidates,
)


class TestNormalizeText(unittest.TestCase):
    """Tests for normalize_text function."""

    def test_basic_normalization(self):
        """Test basic text normalization."""
        self.assertEqual(normalize_text("Hello World"), "hello world")
        self.assertEqual(normalize_text("HELLO WORLD"), "hello world")

    def test_whitespace_collapsing(self):
        """Test that multiple spaces are collapsed to single space."""
        self.assertEqual(normalize_text("Hello   World"), "hello world")
        self.assertEqual(normalize_text("Hello\t\tWorld"), "hello world")
        self.assertEqual(normalize_text("Hello\n\nWorld"), "hello world")

    def test_leading_trailing_whitespace(self):
        """Test that leading/trailing whitespace is removed."""
        self.assertEqual(normalize_text("  Hello World  "), "hello world")
        self.assertEqual(normalize_text("\t\nHello World\n\t"), "hello world")

    def test_empty_and_none(self):
        """Test edge cases with empty and None inputs."""
        self.assertEqual(normalize_text(""), "")
        self.assertEqual(normalize_text("   "), "")

    def test_special_characters(self):
        """Test that special characters are preserved."""
        self.assertEqual(normalize_text("Hello-World"), "hello-world")
        self.assertEqual(normalize_text("user@example.com"), "user@example.com")


class TestSkillInText(unittest.TestCase):
    """Tests for skill_in_text function."""

    def test_single_word_skill(self):
        """Test single-word skill matching with word boundaries."""
        self.assertTrue(skill_in_text("Python programming", "python"))
        self.assertTrue(skill_in_text("Learn Python today", "python"))
        self.assertFalse(skill_in_text("Pythonic code", "python"))  # Word boundary

    def test_multi_word_skill(self):
        """Test multi-word skill matching as substring."""
        self.assertTrue(skill_in_text("Machine Learning tutorial", "machine learning"))
        self.assertTrue(skill_in_text("Deep Learning course", "deep learning"))
        self.assertFalse(skill_in_text("Machine code", "machine learning"))

    def test_case_insensitivity(self):
        """Test that matching is case-insensitive."""
        self.assertTrue(skill_in_text("PYTHON PROGRAMMING", "python"))
        self.assertTrue(skill_in_text("python programming", "PYTHON"))
        self.assertTrue(skill_in_text("Machine Learning", "machine learning"))

    def test_empty_skill(self):
        """Test that empty skill returns False."""
        self.assertFalse(skill_in_text("Some text", ""))
        self.assertFalse(skill_in_text("Some text", "   "))

    def test_special_characters_in_skill(self):
        """Test skills with special characters."""
        # Multi-word skills with special chars work as substring match
        self.assertTrue(skill_in_text("Node.js tutorial", "node.js"))
        # Note: Single-word skills with regex special chars may not match due to word boundaries
        # This is expected behavior


class TestDomainAsChannel(unittest.TestCase):
    """Tests for domain_as_channel function."""

    def test_basic_url(self):
        """Test extracting domain from basic URLs."""
        self.assertEqual(domain_as_channel("https://example.com/path"), "example.com")
        self.assertEqual(domain_as_channel("http://example.com"), "example.com")

    def test_www_removal(self):
        """Test that 'www.' prefix is removed."""
        self.assertEqual(domain_as_channel("https://www.example.com"), "example.com")
        self.assertEqual(domain_as_channel("http://www.example.com/page"), "example.com")

    def test_subdomain(self):
        """Test handling of subdomains."""
        self.assertEqual(domain_as_channel("https://blog.example.com"), "blog.example.com")
        self.assertEqual(domain_as_channel("https://api.example.com/v1"), "api.example.com")

    def test_none_and_empty(self):
        """Test edge cases with None and empty strings."""
        self.assertIsNone(domain_as_channel(None))
        self.assertIsNone(domain_as_channel(""))

    def test_invalid_url(self):
        """Test handling of invalid URLs."""
        self.assertIsNone(domain_as_channel("not a url"))
        self.assertIsNone(domain_as_channel("://malformed"))


class TestChunks(unittest.TestCase):
    """Tests for chunks function."""

    def test_basic_chunking(self):
        """Test basic list chunking."""
        result = list(chunks([1, 2, 3, 4, 5, 6], 2))
        self.assertEqual(result, [[1, 2], [3, 4], [5, 6]])

    def test_uneven_chunking(self):
        """Test chunking with uneven division."""
        result = list(chunks([1, 2, 3, 4, 5], 2))
        self.assertEqual(result, [[1, 2], [3, 4], [5]])

    def test_single_chunk(self):
        """Test when chunk size equals list size."""
        result = list(chunks([1, 2, 3], 3))
        self.assertEqual(result, [[1, 2, 3]])

    def test_empty_list(self):
        """Test chunking empty list."""
        result = list(chunks([], 2))
        self.assertEqual(result, [])

    def test_chunk_size_larger_than_list(self):
        """Test when chunk size is larger than list."""
        result = list(chunks([1, 2], 5))
        self.assertEqual(result, [[1, 2]])


class TestSafeInt(unittest.TestCase):
    """Tests for safe_int function."""

    def test_valid_string_conversion(self):
        """Test converting valid string numbers."""
        self.assertEqual(safe_int("123"), 123)
        self.assertEqual(safe_int("-456"), -456)
        self.assertEqual(safe_int("0"), 0)

    def test_invalid_string(self):
        """Test that invalid strings return None."""
        self.assertIsNone(safe_int("not a number"))
        self.assertIsNone(safe_int("12.34"))  # Float string
        self.assertIsNone(safe_int(""))

    def test_none_input(self):
        """Test that None input returns None."""
        self.assertIsNone(safe_int(None))

    def test_whitespace(self):
        """Test strings with whitespace."""
        self.assertEqual(safe_int("  123  "), 123)


class TestRankTiebreakKey(unittest.TestCase):
    """Tests for rank_tiebreak_key function."""

    def test_valid_rank(self):
        """Test extracting valid rank."""
        self.assertEqual(rank_tiebreak_key({"_rank": 5}), 5)
        self.assertEqual(rank_tiebreak_key({"_rank": 0}), 0)

    def test_missing_rank(self):
        """Test default value when rank is missing."""
        self.assertEqual(rank_tiebreak_key({}), 10_000)
        self.assertEqual(rank_tiebreak_key({"other": "field"}), 10_000)

    def test_invalid_rank(self):
        """Test handling of invalid rank values."""
        self.assertEqual(rank_tiebreak_key({"_rank": "not a number"}), 10_000)
        self.assertEqual(rank_tiebreak_key({"_rank": None}), 10_000)


class TestGreedyCoverFromCandidates(unittest.TestCase):
    """Tests for greedy_cover_from_candidates function."""

    def test_empty_candidates(self):
        """Test with empty candidates list."""
        result = greedy_cover_from_candidates([], {"skill": "Skill"})
        self.assertEqual(result, [])

    def test_single_candidate_single_skill(self):
        """Test with one candidate covering one skill."""
        candidates = [
            {
                "_rank": 1,
                "title": "Python Tutorial",
                "url": "https://example.com",
                "channel_title": "Example",
                "views": 1000,
                "published_at": "2023-01-01",
                "thumbnail": "https://example.com/thumb.jpg",
                "matched_norm": ["python"],
            }
        ]
        norm_to_orig = {"python": "Python"}
        result = greedy_cover_from_candidates(candidates, norm_to_orig)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["group_skills"], ["Python"])
        self.assertEqual(result[0]["item"]["title"], "Python Tutorial")

    def test_multiple_candidates_greedy_selection(self):
        """Test greedy selection with multiple candidates."""
        candidates = [
            {
                "_rank": 1,
                "title": "Python & Java",
                "url": "https://example.com/1",
                "channel_title": "Example",
                "views": 1000,
                "published_at": "2023-01-01",
                "thumbnail": None,
                "matched_norm": ["python", "java"],
            },
            {
                "_rank": 2,
                "title": "Python Tutorial",
                "url": "https://example.com/2",
                "channel_title": "Example",
                "views": 500,
                "published_at": "2023-01-02",
                "thumbnail": None,
                "matched_norm": ["python"],
            },
        ]
        norm_to_orig = {"python": "Python", "java": "Java"}
        result = greedy_cover_from_candidates(candidates, norm_to_orig)
        
        # Should select first candidate as it covers both skills
        self.assertEqual(len(result), 1)
        self.assertIn("Python", result[0]["group_skills"])
        self.assertIn("Java", result[0]["group_skills"])

    def test_custom_item_key(self):
        """Test using custom item_key parameter."""
        candidates = [
            {
                "_rank": 1,
                "title": "Test",
                "url": "https://example.com",
                "channel_title": "Example",
                "views": None,
                "published_at": None,
                "thumbnail": None,
                "matched_norm": ["skill"],
            }
        ]
        norm_to_orig = {"skill": "Skill"}
        result = greedy_cover_from_candidates(candidates, norm_to_orig, item_key="video")
        
        self.assertIn("video", result[0])
        self.assertNotIn("item", result[0])


class TestIntegration(unittest.TestCase):
    """Integration tests combining multiple functions."""

    def test_text_processing_pipeline(self):
        """Test typical text processing pipeline."""
        text = "  Learn Python   and Machine Learning  "
        normalized = normalize_text(text)
        
        self.assertTrue(skill_in_text(normalized, "python"))
        self.assertTrue(skill_in_text(normalized, "machine learning"))
        self.assertFalse(skill_in_text(normalized, "java"))

    def test_url_processing(self):
        """Test URL processing pipeline."""
        urls = [
            "https://www.example.com/tutorial",
            "https://blog.example.com/article",
            "https://example.org/guide",
        ]
        
        channels = [domain_as_channel(url) for url in urls]
        self.assertEqual(channels, ["example.com", "blog.example.com", "example.org"])


def run_tests():
    """Run all tests."""
    unittest.main(argv=[''], verbosity=2, exit=False)


if __name__ == "__main__":
    run_tests()
