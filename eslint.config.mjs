import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 빌드 오류 방지를 위한 규칙 조정
      "@typescript-eslint/no-explicit-any": "off", // any 타입 사용 허용 (점진적 개선)
      "react/no-unescaped-entities": "off", // 이스케이프되지 않은 엔티티 허용
      "jsx-a11y/alt-text": "warn", // 접근성 경고는 유지
      "@typescript-eslint/no-unused-vars": [
        "off", // 사용하지 않는 변수 경고 비활성화
      ],
      "react-hooks/exhaustive-deps": "off", // Hook 의존성 경고 비활성화
      "@next/next/no-html-link-for-pages": "error", // Next.js Link 사용은 에러로 유지
      "@next/next/no-img-element": "off", // img 태그 사용 허용
      "@next/next/no-before-interactive-script-outside-document": "off",
      "@next/next/next-script-for-ga": "off",
      "jsx-a11y/role-supports-aria-props": "off",
      "jsx-a11y/role-has-required-aria-props": "off",
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": "allow-with-description",
          "ts-nocheck": "allow-with-description",
          "ts-check": false,
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off", // 빈 인터페이스 허용
      "prefer-const": "warn", // const 선호는 경고로 유지
    },
  },
  {
    files: ["src/scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off", // JavaScript 파일에서 require 허용
    },
  },
];

export default eslintConfig;
