import { NextResponse } from "next/server";
import dayjs from "dayjs";

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
      const body = {
        isValid: true,
        message: "卡密校验成功",
        couponData: JSON.parse(verifyCodeData.data.coupon_info),
        info: {
          user: JSON.parse(verifyCodeData.data.coupon_info)?.[0]?.user ?? null,
          usedTime: verifyCodeData.data?.firstUseTime ? dayjs(verifyCodeData.data?.firstUseTime).format("YYYY-MM-DD HH:mm:ss") : null,
        },
      };
      return NextResponse.json(body);
    } else {
      return NextResponse.json({ isValid: false, message: "卡密无效" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ isValid: false, message: "卡密校验失败" }, { status: 401 });
  }
}
