import { useState } from 'react';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, Search } from 'lucide-react';

const HelpCenter = ({ user, onNavigate }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const faqs = [
    {
      id: 1,
      category: '账号问题',
      questions: [
        {
          q: '如何修改密码？',
          a: '在个人中心点击设置，选择修改密码，输入旧密码和新密码即可完成修改。',
        },
        {
          q: '忘记密码怎么办？',
          a: '在登录页面点击忘记密码，通过手机号接收验证码来重置密码。',
        },
        {
          q: '如何绑定手机号？',
          a: '在个人中心点击设置，选择绑定手机号，输入手机号和验证码即可完成绑定。',
        },
      ],
    },
    {
      id: 2,
      category: '直播相关',
      questions: [
        {
          q: '如何成为主播？',
          a: '在个人中心点击主播认证，填写真实姓名和身份证信息，提交审核后等待通过即可。',
        },
        {
          q: '直播时如何开启美颜？',
          a: '在开播页面点击美颜按钮，可以调整美白、磨皮、瘦脸等参数。',
        },
        {
          q: '如何设置直播间密码？',
          a: '在开播设置中选择私密直播，设置密码后观众需要输入密码才能进入。',
        },
      ],
    },
    {
      id: 3,
      category: '充值提现',
      questions: [
        {
          q: '如何充值钻石？',
          a: '在个人中心点击我的账户，选择充值，选择充值金额和支付方式完成支付。',
        },
        {
          q: '钻石可以提现吗？',
          a: '钻石不能直接提现，但主播可以将钻石兑换成收益后提现到支付宝。',
        },
        {
          q: '提现多久到账？',
          a: '提现申请提交后，一般在1-3个工作日内到账，具体取决于银行处理速度。',
        },
      ],
    },
    {
      id: 4,
      category: '礼物系统',
      questions: [
        {
          q: '如何送礼物？',
          a: '在直播间点击礼物按钮，选择想要赠送的礼物，点击发送即可。',
        },
        {
          q: '礼物收益如何计算？',
          a: '礼物收益 = 礼物钻石价值 × 分成比例，主播可在收益中心查看详细收益。',
        },
        {
          q: '如何查看送礼记录？',
          a: '在个人中心点击送出礼物，可以查看所有送礼记录和消费明细。',
        },
      ],
    },
    {
      id: 5,
      category: '隐私安全',
      questions: [
        {
          q: '如何隐藏我的在线状态？',
          a: '在设置中选择隐私设置，关闭在线状态显示即可。',
        },
        {
          q: '如何拉黑用户？',
          a: '在用户资料页点击更多，选择拉黑，该用户将无法给你发私信和评论。',
        },
        {
          q: '账号被盗怎么办？',
          a: '立即联系客服，提供注册手机号和身份信息，我们会帮你找回账号。',
        },
      ],
    },
  ];

  const filteredFaqs = faqs.map(faq => ({
    ...faq,
    questions: faq.questions.filter(q => 
      q.q.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      q.a.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  })).filter(faq => faq.questions.length > 0);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 h-16 flex items-center">
        <div className="flex items-center gap-3 px-4">
          <button
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">帮助中心</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-24">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="搜索问题..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>

        {searchKeyword && filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">未找到相关问题</p>
          </div>
        )}

        {!searchKeyword && (
          <div className="mt-6">
            <h2 className="text-sm font-bold text-white mb-3">热门问题</h2>
            <div className="space-y-2">
              {['如何成为主播？', '如何充值钻石？', '提现多久到账？', '忘记密码怎么办？'].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchKeyword(q);
                  }}
                  className="w-full flex items-center gap-2 text-left text-gray-400 hover:text-white py-2 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs">{idx + 1}</span>
                  <span className="text-sm">{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-gray-800/40 rounded-xl border border-gray-700/30 overflow-hidden">
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700/40 transition-colors"
              >
                <span className="text-white text-sm font-medium">{faq.category}</span>
                {expandedId === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedId === faq.id && (
                <div className="px-4 pb-4 space-y-2">
                  {faq.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-700/30 rounded-xl p-3">
                      <p className="text-white text-sm font-medium mb-1">{q.q}</p>
                      <p className="text-gray-400 text-xs">{q.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-2xl p-5 border border-blue-500/20">
          <h2 className="text-white font-bold mb-3">联系客服</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl px-4 py-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">在线客服</p>
                <p className="text-gray-500 text-xs">工作日 9:00-21:00</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl px-4 py-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">客服电话</p>
                <p className="text-gray-500 text-xs">400-888-8888</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl px-4 py-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">邮件反馈</p>
                <p className="text-gray-500 text-xs">support@gala.live</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
