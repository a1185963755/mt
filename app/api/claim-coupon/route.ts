import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function POST(request: Request) {
  const { linkUrl, code } = await request.json();
  // 校验是否为合法链接
  if (!linkUrl) {
    return NextResponse.json({ success: false, message: "链接不能为空" });
  }
  let token;
  let userId;
  try {
    const searchParams = new URLSearchParams(new URL(linkUrl).search);
    token = searchParams.get("token");
    userId = searchParams.get("userId");
    if (!token || !userId) {
      return NextResponse.json({ success: false, message: "链接参数错误" });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "链接参数错误" });
  }

  const couponData = await fetch(`http://localhost:7654/api/key-cards/getMtCoupon`, {
    method: "POST",
    body: JSON.stringify({
      mtToken: token,
      userId,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-key-card": code,
    },
  });
  const res = await couponData.json();

  if (res.success) {
    return NextResponse.json({
      success: true,
      message: "恭喜您，红包领取成功！",
      couponData: res.data.coupon_info,
      info: {
        user: res.data.coupon_info?.[0]?.user ?? "未知",
        usedTime: dayjs(res.data?.firstUseTime).format("YYYY-MM-DD HH:mm:ss"),
      },
    });
  } else {
    return NextResponse.json({ success: false, message: "抱歉，红包领取失败，请稍后再试或检查链接。" }, { status: 500 });
  }
}
