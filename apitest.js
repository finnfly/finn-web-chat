/**
 * ⚠️ 警告：本文件仅用于自动化扫描工具的测试，请勿在真实生产环境中使用！
 * 以下内容均为模拟生成的随机字符串，不具备真实访问权限。
 */

// 1. 测试 OpenAI Key
const openAiKey = "sk-ant-api03-P9zL1kR8m2N5j7Q4w3E1r6T0y9U8i7O6p5A4s3D2f1G";

// 2. 测试 GitHub Token (classic & fine-grained)
const github_classic = "ghp_m1n2b3v4c5x6z7l8k9j0h1g2f3d4s5a6p7o8";
const github_oauth = "gho_9876543210abcdefghijklmnopqrstuvwxyz";

// 3. 测试 AWS Access Key ID
const AWS_CONFIG = {
  accessKeyId: "AKIA5F7D3E2B1A9C8D7E", 
  secretAccessKey: "THIS_IS_A_SECRET_KEY_NOT_READABLE_BY_PATTERN" 
};

// 4. 测试 Google API Key
const googleMapKey = "AIzaSyD4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t";

// 5. 测试 Stripe Live Key
const stripe_secret = "sk_live_51MabcDEFghiJKLmnoPQRstuVWXyz12345";

// 6. 测试 Twitter (X) API Token
const twitterToken = "twitter_auth_token_1234567890abcdefghijklmnopqrstuvwxyz123";

// 7. 测试 Facebook Access Token
const fbToken = "EAABsbCS1iHgBAD2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0";

// 8. 测试通用关键词匹配 (Generic patterns)
const config = {
  "api_key": "v1234567890abcdefghij", // Generic API Key
  "my_secret": "s3cr3t_p4ssw0rd_h3r3_now", // Generic Secret
  "auth_token": "token_val_0987654321fedcba" // Generic Token
};

function main() {
  console.log("正在启动安全扫描测试...");
  // 模拟泄露逻辑
  fetch(`https://api.example.com/data?key=${config.api_key}`);
}

export default main;
