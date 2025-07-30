import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ isValid: false, message: "缺少卡密参数" }, { status: 400 });
  }
  try {
    const verifyCode = await fetch(`http://localhost:7654/api/key-cards/info?code=${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const verifyCodeData = await verifyCode.json();
    if (verifyCodeData.success) {
      return NextResponse.json({ isValid: true, message: "卡密校验成功" });
    } else {
      return NextResponse.json({ isValid: false, message: "卡密无效" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ isValid: false, message: "卡密校验失败" }, { status: 401 });
  }
}
