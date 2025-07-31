"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Gift, Clock, User, CheckCircle, Play, ExternalLink, XCircle, Loader2, Ticket } from "lucide-react"; // Added Ticket icon
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ClaimStatus = "idle" | "loading" | "success" | "failure";
type CodeValidationStatus = "checking" | "valid" | "invalid";

export default function Component() {
  const searchParams = useSearchParams();
  const [linkUrl, setLinkUrl] = useState("");
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>("idle");
  const [claimMessage, setClaimMessage] = useState("");
  const [codeValidationStatus, setCodeValidationStatus] = useState<CodeValidationStatus>("checking");

  useEffect(() => {
    const code = searchParams.get("code");

    const validateCode = async () => {
      if (!code) {
        setCodeValidationStatus("invalid");
        return;
      }

      try {
        const response = await fetch(`/api/validate-code?code=${code}`);
        const data = await response.json();

        if (data.isValid) {
          setCodeValidationStatus("valid");
          if (data.couponData?.length > 0) {
            setClaimStatus("success");
            setClaimMessage("恭喜您，红包领取成功！");
            toast({
              title: "领取成功",
              description: "您的美团红包已成功到账。",
              variant: "default",
            });
            setCouponData(() => data.couponData);
            setKeyCardInfo(() => {
              return {
                code,
                ...data.info,
              };
            });
          }
        } else {
          setCodeValidationStatus("invalid");
        }
      } catch (error) {
        console.error("Error validating code:", error);
        setCodeValidationStatus("invalid"); // Treat network errors as invalid
      }
    };

    validateCode();
  }, [searchParams]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "复制成功",
      description: "内容已复制到剪贴板",
    });
  };
  const [couponData, setCouponData] = useState<{ text: string; color: string }[]>([]);
  const [keyCardInfo, setKeyCardInfo] = useState({ code: "", user: "", usedTime: "" });

  const faqs = [
    {
      question: "为什么我无法领取红包？",
      answer: "请检查您的美团账号是否已登录，或链接是否有效。部分红包可能有限制条件，如新用户专享、特定区域可用等。",
    },
    {
      question: "如何获取美团链接？",
      answer: "请参照上方的“获取链接教程”步骤，登录美团APP，找到分享按钮并复制链接。",
    },
    {
      question: "领取失败怎么办？",
      answer: "如果领取失败，请尝试重新获取链接，或联系美团客服寻求帮助。",
    },
    {
      question: "红包有效期是多久？",
      answer: "红包有效期通常在领取后显示，请注意查看红包详情页面的说明。",
    },
    {
      question: "我领取的红包在哪里查看？",
      answer: "成功领取的红包通常会直接发放到您的美团账户中。您可以在美团APP的“我的”-“红包/卡券”中查看。",
    },
    {
      question: "为什么我领取的红包金额和描述不符？",
      answer: "红包金额可能因活动规则、用户等级或地区差异而有所不同。请仔细阅读红包详情页面的使用说明。",
    },
    {
      question: "我可以重复领取红包吗？",
      answer: "通常情况下，每个用户或每个美团账号对同一类型的红包只能领取一次。具体规则请参考活动说明。",
    },
    {
      question: "链接失效了怎么办？",
      answer: "如果链接失效，可能是活动已结束或红包已领完。请尝试获取最新的活动链接，或关注美团官方活动。",
    },
  ];

  const handleClaim = async () => {
    setClaimStatus("loading");
    setClaimMessage("");
    const code = new URLSearchParams(new URL(window.location.href).search).get("code") || "";
    try {
      const response = await fetch("/api/claim-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkUrl,
          code,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setClaimStatus("success");
        setClaimMessage(data.message);
        toast({
          title: "领取成功",
          description: "您的美团红包已成功到账。",
          variant: "default",
        });
        setCouponData(() => data.couponData);
        setKeyCardInfo(() => {
          return {
            code,
            ...data.info,
          };
        });
      } else {
        setClaimStatus("failure");
        setClaimMessage(data.message || "抱歉，红包领取失败，请稍后再试或检查链接。");
        toast({
          title: "领取失败",
          description: data.message || "请检查链接是否有效或稍后再试。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming coupon:", error);
      setClaimStatus("failure");
      setClaimMessage("网络错误，请检查您的网络连接。");
      toast({
        title: "领取失败",
        description: "网络错误，请检查您的网络连接。",
        variant: "destructive",
      });
    }
  };

  const resetClaim = () => {
    setClaimStatus("idle");
    setClaimMessage("");
    setLinkUrl("");
  };

  if (codeValidationStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm p-8 text-center space-y-4">
          <Loader2 className="w-16 h-16 text-gray-500 mx-auto animate-spin" />
          <h2 className="text-xl font-bold text-gray-700">正在校验卡密...</h2>
          <p className="text-gray-600">请稍候</p>
        </Card>
      </div>
    );
  }

  if (codeValidationStatus === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm p-8 text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto animate-shake" />
          <h2 className="text-xl font-bold text-red-700">卡密错误</h2>
          <p className="text-gray-600">请检查您的链接是否包含正确的卡密参数，或联系客服。</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                美团外卖红包
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        {/* Conditional Rendering for Input/Result */}
        {claimStatus === "idle" || claimStatus === "loading" ? (
          <>
            {/* Link Input Card */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">美团链接</label>
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="请输入美团链接"
                      className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      disabled={claimStatus === "loading"}
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-md"
                    size="lg"
                    onClick={handleClaim}
                    disabled={claimStatus === "loading"}
                  >
                    {claimStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        领取中...
                      </>
                    ) : (
                      "立即领取"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Claim Result Card
          <>
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm animate-in fade-in zoom-in-95">
              <CardContent className="p-6 text-center space-y-4">
                {claimStatus === "success" ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto animate-shake" />
                )}
                <h2 className={`text-xl font-bold ${claimStatus === "success" ? "text-green-700" : "text-red-700"}`}>{claimMessage}</h2>
                {claimStatus === "success" && (
                  <div className="pt-2 border-t mt-4">
                    <span className="text-gray-600 font-medium mb-3 block">您已领取以下红包:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {couponData.map((coupon, index) => (
                        <div
                          key={index}
                          className={`${coupon.color} bg-green-50 text-xs py-2 px-3 rounded-md border border-green-200 flex items-center`}
                        >
                          <Ticket className="w-3 h-3 mr-1" /> {/* Changed icon here */}
                          {coupon.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-md mt-4"
                  size="lg"
                  onClick={resetClaim}
                >
                  {claimStatus === "success" ? "祝您用餐愉快！" : "重新领取"}
                </Button>
              </CardContent>
            </Card>

            {claimStatus === "success" && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">卡密信息:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono">{keyCardInfo.code}</code>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy("4FLY0yXJHv6De3A")} className="h-8 w-8 p-0">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">结果查询:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        领取成功
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">领取时间:</span>
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Clock className="w-4 h-4" />
                        {keyCardInfo.usedTime}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">美团账号:</span>
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <User className="w-4 h-4" />
                        {keyCardInfo.user}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Tutorial Steps Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold text-gray-800">获取链接教程</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">登录美团账号</h3>
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-4 relative">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                        <div className="text-center mb-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-2">
                            <span className="text-white font-bold text-lg">美团</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-2">美团账号登录</div>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <span className="text-xs text-gray-600">手机号/邮箱</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <span className="text-xs text-gray-600">密码</span>
                          </div>
                          <div className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white py-2 rounded-md text-center text-sm font-medium">
                            立即登录
                          </div>
                        </div>
                      </div>
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-0 h-0 border-l-8 border-l-orange-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">打开美团红包页面</h3>
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 relative">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            <span className="text-xs text-gray-600">美团外卖</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">⋯</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600 mb-1">登录成功后</div>
                          <div className="text-sm text-gray-600">点击右上角 (⋯)</div>
                        </div>
                      </div>
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-0 h-0 border-l-8 border-l-blue-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">登录成功后点击右上角并复制链接</h3>
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-gray-500 mb-2 text-center">分享到</div>
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-xs">微</span>
                            </div>
                            <span className="text-xs text-gray-600">微信</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-xs">朋</span>
                            </div>
                            <span className="text-xs text-gray-600">朋友圈</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-xs">QQ</span>
                            </div>
                            <span className="text-xs text-gray-600">QQ</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mb-1">
                              <Copy className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-orange-600 font-semibold">复制链接</span>
                          </div>
                        </div>
                        <div className="border-t pt-2">
                          <div className="bg-orange-500 text-white px-6 py-2 rounded-md text-center text-sm font-medium">复制链接</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                size="sm"
                onClick={() => window.open("https://passport.meituan.com/useraccount/ilogin", "_blank")}
              >
                前往获取链接
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tutorial Video Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold text-gray-800">领券视频教程</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-inner">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-white space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-sm opacity-90">点击播放教程视频</p>
                </div>
              </div>
              {/* <Button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0" size="sm">
                进入群聊群聊观看
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold text-gray-800">常见问题</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium text-gray-700 hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm pb-2">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
