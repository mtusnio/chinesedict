import unittest
from add_jyutping import convert_line

class TestConvertLine(unittest.TestCase):
    def test_simple(self):
        self.assertEqual(convert_line("不倦 不倦 [bu4 juan4] /tireless/untiring/indefatigable/"),
                         "不倦 不倦 [bu4 juan4] {bat1 gyun6} /tireless/untiring/indefatigable/")

    def test_already_converted(self):
        self.assertEqual(convert_line("不倦 不倦 [bu4 juan4] {bat1 gyun6} /tireless/untiring/indefatigable/"),
                         "不倦 不倦 [bu4 juan4] {bat1 gyun6} /tireless/untiring/indefatigable/")

    def test_mix_fails(self):
        self.assertEqual(convert_line("A貨 A货 [A huo4] /good-quality fake/"),
                         "A貨 A货 [A huo4] {} /good-quality fake/")


if __name__ == '__main__':
    unittest.main()
