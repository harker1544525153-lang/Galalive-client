import { useState } from 'react';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Shield,
  ShieldCheck,
  Ban,
  Bell,
  HelpCircle,
  RefreshCw,
  Info,
  FileText,
  LogOut,
  ChevronRight,
  Headphones,
  Wallet,
  Radio,
  KeyRound,
  Lock,
  Baby,
  MessageSquare,
  Pencil,
  X,
} from 'lucide-react';

const Settings = ({ user, onNavigate, onLogout }) => {
  const [teenMode, setTeenMode] = useState(false);
  const [pushLive, setPushLive] = useState(true);
  const [pushMessage, setPushMessage] = useState(true);
  const [pushAttention, setPushAttention] = useState(true);
  const [pushGift, setPushGift] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [showHelp, setShowHelp] = useState(null);
  const [showAbout, setShowAbout] = useState(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const DOWNLOAD_URL = 'https://galalive.app/download';
  const APP_VERSION = 'v1.0.0';

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout && onLogout();
    onNavigate && onNavigate('login');
  };

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setTimeout(() => {
      setCheckingUpdate(false);
      const confirmed = window.confirm('当前已是最新版本，是否前往下载页面？');
      if (confirmed) {
        window.open(DOWNLOAD_URL, '_blank');
      }
    }, 1500);
  };

  const blacklist = [
    { id: 1, nickname: '被屏蔽的用户A', username: 'user_blocked_1', avatar: '' },
    { id: 2, nickname: '被屏蔽的用户B', username: 'user_blocked_2', avatar: '' },
  ];

  const helpItems = [
    {
      key: 'faq',
      icon: HelpCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      label: '常见问题',
      description: '查看使用中常见的问题解答',
      content: [
        { q: '如何开通直播？', a: '完成实名认证后，在「我的-开播」中申请开播权限，审核通过即可开始直播。' },
        { q: '如何充值钻石？', a: '在「我的-钱包」中点击充值，选择对应套餐完成支付即可。' },
        { q: '如何提现？', a: '达到提现门槛后，在「钱包-提现」中绑定银行卡，提交提现申请。' },
        { q: '如何修改昵称？', a: '在「我的-编辑资料」中修改，每月可修改一次。' },
      ],
    },
    {
      key: 'recharge',
      icon: Wallet,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      label: '充值问题',
      description: '充值未到账、充值错误等问题',
      content: [
        { q: '充值未到账怎么办？', a: '请先确认支付是否成功，若支付成功但未到账，请提供支付订单号联系客服处理。' },
        { q: '可以申请退款吗？', a: '虚拟商品一经购买原则上不支持退款，特殊情况请联系客服处理。' },
        { q: '充值有优惠吗？', a: '关注活动页面，不定期推出充值优惠活动。' },
      ],
    },
    {
      key: 'live',
      icon: Radio,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
      label: '直播问题',
      description: '开播、连麦、直播卡顿等问题',
      content: [
        { q: '直播卡顿怎么办？', a: '请检查网络环境，建议在 Wi-Fi 或 4G/5G 网络下开播，也可尝试降低画质。' },
        { q: '如何与主播连麦？', a: '在直播间点击连麦按钮，等待主播同意即可。' },
        { q: '直播被禁播怎么办？', a: '请查看违规记录，按要求整改后申诉，客服会尽快审核。' },
      ],
    },
    {
      key: 'account',
      icon: KeyRound,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      label: '账号问题',
      description: '账号被盗、封禁、注销等问题',
      content: [
        { q: '账号被盗怎么办？', a: '请立即修改密码，并联系客服冻结账号，提供相关证明材料申诉。' },
        { q: '如何注销账号？', a: '在「账号安全-注销账号」中提交申请，7 天后正式注销。' },
        { q: '账号被封禁如何申诉？', a: '在「帮助-申诉」中提交申诉材料，客服会在 3 个工作日内回复。' },
      ],
    },
    {
      key: 'service',
      icon: Headphones,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      label: '咨询客服',
      description: '人工客服在线为您解答',
      action: () => {
        alert('正在为您接入客服...');
      },
    },
  ];

  const aboutItems = [
    {
      key: 'host_agreement',
      icon: FileText,
      label: '主播协议',
      description: '主播入驻及直播相关协议',
      content: 'Gala Live 主播协议\n\n一、主播须遵守国家相关法律法规，不得传播违法违规内容。\n\n二、主播须保证所提供内容为原创或已获授权，不得侵犯他人知识产权。\n\n三、直播内容须符合平台规范，禁止涉及政治、色情、暴力等敏感话题。\n\n四、平台有权对违规主播进行处罚，包括但不限于警告、禁播、封号等。\n\n五、主播收益按平台分成比例结算，具体规则详见收益说明。',
    },
    {
      key: 'privacy',
      icon: Lock,
      label: '隐私政策',
      description: '我们如何保护您的隐私',
      content: 'Gala Live 隐私政策\n\n一、我们收集的个人信息包括：账号信息、设备信息、使用记录等。\n\n二、我们仅在必要时收集您的个人信息，并采取严格的安全措施保护您的隐私。\n\n三、我们不会向第三方出售您的个人信息，仅在您同意的情况下共享。\n\n四、您有权随时查看、修改、删除您的个人信息。\n\n五、如需了解更多隐私相关事宜，请联系我们的隐私专员。',
    },
    {
      key: 'about',
      icon: Info,
      label: '关于我们',
      description: '了解 Gala Live',
      content: '关于 Gala Live\n\nGala Live 是一个面向全球用户的直播社交平台，致力于为用户提供优质的直播内容和互动体验。\n\n我们的使命：连接每一个有故事的人。\n\n我们的愿景：成为最受欢迎的直播社交平台。\n\n版本：' + APP_VERSION + '\n\n联系我们：support@galalive.app',
    },
  ];

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!value);
      }}
      className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ${
        value ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-700'
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
          value ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );

  const SettingRow = ({ icon: Icon, iconColor, iconBg, label, description, onClick, toggle, value, onChange, rightText }) => (
    <div
      onClick={!toggle ? onClick : undefined}
      className={`flex items-center justify-between p-4 transition-all ${
        !toggle ? 'cursor-pointer hover:bg-gray-800/50' : ''
      } border-b border-gray-700/30 last:border-b-0`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-full ${iconBg || 'bg-gray-700/50'} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor || 'text-gray-400'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium text-sm">{label}</p>
          {description && <p className="text-gray-500 text-xs truncate">{description}</p>}
        </div>
      </div>
      {toggle ? (
        <Toggle value={value} onChange={onChange} />
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightText && <span className="text-gray-500 text-xs">{rightText}</span>}
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/5 to-gray-900 flex flex-col">
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50 h-16 flex items-center">
        <div className="max-w-4xl mx-auto px-4 w-full flex items-center justify-between">
          <button
            onClick={() => onNavigate && onNavigate('profile')}
            className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-pink-500" />
            <h1 className="text-xl font-bold text-white">设置</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* 用户信息卡片 */}
        <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-5 mb-6 border border-pink-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{user?.nickname || '用户'}</h2>
              <p className="text-gray-400 text-sm">ID: {user?.id || '000000'}</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('profile')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-pink-500/30"
            >
              <Pencil className="w-4 h-4" />
              编辑资料
            </button>
          </div>
        </div>

        {/* 账号与安全 */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 px-2">
            账号与安全
          </h3>
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/30">
            <SettingRow
              icon={Baby}
              iconColor="text-yellow-400"
              iconBg="bg-yellow-500/20"
              label="青少年模式"
              description={teenMode ? '已开启 · 限制使用时长和内容' : '未开启 · 保护未成年人健康使用'}
              toggle
              value={teenMode}
              onChange={(v) => {
                if (v) {
                  const pwd = window.prompt('请设置青少年模式密码（4位数字）');
                  if (pwd && pwd.length === 4) {
                    setTeenMode(true);
                    alert('青少年模式已开启');
                  } else if (pwd !== null) {
                    alert('密码必须为4位数字');
                  }
                } else {
                  const pwd = window.prompt('请输入密码关闭青少年模式');
                  if (pwd) {
                    setTeenMode(false);
                    alert('青少年模式已关闭');
                  }
                }
              }}
            />
            <SettingRow
              icon={ShieldCheck}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/20"
              label="账号安全"
              description="修改密码、绑定手机、登录设备"
              onClick={() => alert('账号安全')}
            />
            <SettingRow
              icon={Shield}
              iconColor="text-green-400"
              iconBg="bg-green-500/20"
              label="实名认证"
              description="完成认证获取更多权益"
              onClick={() => alert('实名认证')}
            />
          </div>
        </div>

        {/* 隐私与通知 */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 px-2">
            隐私与通知
          </h3>
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/30">
            <SettingRow
              icon={Ban}
              iconColor="text-red-400"
              iconBg="bg-red-500/20"
              label="黑名单"
              description="管理已屏蔽的用户"
              onClick={() => setShowBlacklist(true)}
            />
            <SettingRow
              icon={Radio}
              iconColor="text-pink-400"
              iconBg="bg-pink-500/20"
              label="接收直播消息提醒"
              description="关注主播开播时通知"
              toggle
              value={pushLive}
              onChange={setPushLive}
            />
            <SettingRow
              icon={MessageSquare}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/20"
              label="私信提醒"
              description="收到新私信时通知"
              toggle
              value={pushMessage}
              onChange={setPushMessage}
            />
            <SettingRow
              icon={Bell}
              iconColor="text-yellow-400"
              iconBg="bg-yellow-500/20"
              label="关注提醒"
              description="有新粉丝关注时通知"
              toggle
              value={pushAttention}
              onChange={setPushAttention}
            />
            <SettingRow
              icon={Wallet}
              iconColor="text-orange-400"
              iconBg="bg-orange-500/20"
              label="礼物提醒"
              description="收到礼物时通知"
              toggle
              value={pushGift}
              onChange={setPushGift}
            />
          </div>
        </div>

        {/* 通用设置 */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 px-2">
            通用设置
          </h3>
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/30">
            <SettingRow
              icon={RefreshCw}
              iconColor={checkingUpdate ? 'text-green-400' : 'text-cyan-400'}
              iconBg="bg-cyan-500/20"
              label="检查更新"
              description={checkingUpdate ? '正在检查...' : '检查并安装最新版本'}
              onClick={handleCheckUpdate}
              rightText={APP_VERSION}
            />
            <SettingRow
              icon={Bell}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/20"
              label="通知设置"
              description="系统通知权限管理"
              onClick={() => alert('通知设置')}
            />
            <SettingRow
              icon={Info}
              iconColor="text-gray-400"
              iconBg="bg-gray-700/50"
              label="清除缓存"
              description="已缓存 0 MB"
              onClick={() => alert('缓存已清除')}
            />
          </div>
        </div>

        {/* 帮助与支持 */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 px-2">
            帮助与支持
          </h3>
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/30">
            {helpItems.map((item) => (
              <SettingRow
                key={item.key}
                icon={item.icon}
                iconColor={item.color}
                iconBg={item.bgColor}
                label={item.label}
                description={item.description}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setShowHelp(item);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* 关于我们 */}
        <div className="mb-6">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 px-2">
            关于我们
          </h3>
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl overflow-hidden border border-gray-700/30">
            {aboutItems.map((item) => (
              <SettingRow
                key={item.key}
                icon={item.icon}
                iconColor="text-gray-400"
                iconBg="bg-gray-700/50"
                label={item.label}
                description={item.description}
                onClick={() => setShowAbout(item)}
              />
            ))}
          </div>
        </div>

        {/* 退出登录 */}
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-4 mb-6 border border-red-500/20">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-3 text-red-500 font-bold hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>

        <div className="text-center pb-4">
          <p className="text-gray-600 text-sm">Gala Live {APP_VERSION}</p>
          <p className="text-gray-700 text-xs mt-1">© 2025 Gala Live. All rights reserved.</p>
        </div>
      </main>

      {/* 黑名单弹窗 */}
      {showBlacklist && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          onClick={() => setShowBlacklist(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full md:max-w-md bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 max-h-[80vh] flex flex-col border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" /> 黑名单
              </h3>
              <button
                onClick={() => setShowBlacklist(false)}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {blacklist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Ban className="w-10 h-10 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-sm">暂无黑名单用户</p>
                </div>
              ) : (
                blacklist.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{u.nickname}</p>
                      <p className="text-gray-500 text-xs">@{u.username}</p>
                    </div>
                    <button
                      onClick={() => alert(`已移出黑名单：${u.nickname}`)}
                      className="text-pink-500 text-xs font-medium px-3 py-1.5 rounded-full bg-pink-500/10 hover:bg-pink-500/20 transition-all"
                    >
                      移出
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 帮助详情弹窗 */}
      {showHelp && (() => {
        const HelpIcon = showHelp.icon;
        return (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowHelp(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full md:max-w-lg bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 max-h-[80vh] flex flex-col border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold flex items-center gap-2">
                  <HelpIcon className={`w-5 h-5 ${showHelp.color}`} />
                  {showHelp.label}
                </h3>
                <button
                  onClick={() => setShowHelp(null)}
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4">
                {showHelp.content.map((item, idx) => (
                  <div key={idx} className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-white font-medium text-sm mb-2">Q: {item.q}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 关于详情弹窗 */}
      {showAbout && (() => {
        const AboutIcon = showAbout.icon;
        return (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowAbout(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full md:max-w-lg bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 max-h-[80vh] flex flex-col border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold flex items-center gap-2">
                  <AboutIcon className="w-5 h-5 text-pink-400" />
                  {showAbout.label}
                </h3>
                <button
                  onClick={() => setShowAbout(null)}
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                    {showAbout.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 退出登录确认弹窗 */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs bg-gray-900 rounded-3xl p-6 border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-white text-lg font-bold mb-1">退出登录</h3>
              <p className="text-gray-400 text-sm">确定要退出当前账号吗？</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
              >
                确认退出
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 检查更新加载 */}
      {checkingUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mb-3" />
            <p className="text-white text-sm">正在检查更新...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
