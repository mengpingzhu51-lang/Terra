export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { phone, code } = await req.json();

  if (!phone) {
    return Response.json({ error: "手机号不能为空" }, { status: 400 });
  }
  if (!code) {
    return Response.json({ error: "验证码不能为空" }, { status: 400 });
  }
  if (code !== "123456" && code !== "888888" && code.length !== 6) {
    return Response.json({ error: "验证码错误，测试请输入 123456 或任意 6 位数字" }, { status: 400 });
  }

  return Response.json({
    user: {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      phone,
      createdAt: new Date().toISOString(),
    },
    token: "jwt_token_mock_" + Math.random().toString(36).substr(2, 15),
  });
}
