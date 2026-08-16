window.__ModuleLoader__.load({
  id: "@baihejiangnan/dsh-custom-wallpaper",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const react = require("react");
		const h = react.createElement;

		// ---- CSS (effects + font linkage + official card chrome) ----------
		const css = [
			"body[data-custom-wallpaper]{background-color:transparent}",
			"body[data-custom-wallpaper]::before{content:\"\";position:fixed;top:0;left:0;right:0;bottom:0;z-index:-1;background-image:var(--cw-wallpaper,none);background-position:center;background-size:cover;background-repeat:no-repeat;filter:blur(var(--cw-blur,0px));transform:scale(1.05)}",
			"body[data-custom-wallpaper] [id='root']{background:transparent}",
			"body[data-custom-wallpaper]{--dsw-alias-bg-base:rgba(255,255,255,var(--cw-opacity,0.85));--dsw-alias-bg-layer-1:rgba(244,248,253,var(--cw-opacity,0.85));--dsw-alias-bg-layer-2:rgba(235,242,250,var(--cw-opacity,0.85));--dsw-alias-bg-layer-3:rgba(226,236,248,var(--cw-opacity,0.85));--dsw-specific-sidebar-fill:rgba(242,247,252,var(--cw-opacity,0.9));--dsw-specific-input-major:rgba(255,255,255,var(--cw-opacity,0.85))}",
			"body[data-custom-wallpaper][data-ds-dark-theme]{--dsw-alias-bg-base:rgba(15,23,42,var(--cw-opacity,0.85));--dsw-alias-bg-layer-1:rgba(18,36,76,var(--cw-opacity,0.85));--dsw-alias-bg-layer-2:rgba(23,44,88,var(--cw-opacity,0.85));--dsw-alias-bg-layer-3:rgba(28,52,100,var(--cw-opacity,0.85));--dsw-specific-sidebar-fill:rgba(14,30,64,var(--cw-opacity,0.9));--dsw-specific-input-major:rgba(18,36,76,var(--cw-opacity,0.85))}",
			"body[data-custom-wallpaper][data-cw-font='dark']{--dsw-alias-label-primary:rgba(228,234,244,0.95);--dsw-alias-label-secondary:rgba(228,234,244,0.72);--dsw-alias-label-tertiary:rgba(228,234,244,0.52);--dsw-alias-label-dimmed:rgba(228,234,244,0.42);color:#e2e8f0}",
			"body[data-custom-wallpaper][data-cw-font='light']{--dsw-alias-label-primary:rgba(18,28,48,0.95);--dsw-alias-label-secondary:rgba(18,28,48,0.72);--dsw-alias-label-tertiary:rgba(18,28,48,0.52);--dsw-alias-label-dimmed:rgba(18,28,48,0.42);color:#0f172a}"
		].join("");

    const tagId = "@baihejiangnan/dsh-custom-wallpaper/custom-wallpaper.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
      tag.dataset.plugin = "@baihejiangnan/dsh-custom-wallpaper";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		// Official ui-plugin-config PluginCard chrome (same stylesheet, so the
		// card reads as a sibling of the built-in Shell / Agent loop / Web search cards).
		const cssCard = "__PLUGIN_CARD_CSS__";
    const tagIdCard = "@baihejiangnan/dsh-custom-wallpaper/plugin-card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagIdCard) + "]") === null) {
			const tagCard = document.createElement("style");
      tagCard.dataset.plugin = "@baihejiangnan/dsh-custom-wallpaper";
			tagCard.dataset.pluginCss = tagIdCard;
			tagCard.textContent = cssCard;
			document.head.appendChild(tagCard);
		}

		// ---- presets ------------------------------------------------------
		const PRESET_OFFICIAL_URL = "data:image/jpeg;base64,__PRESET_BASE64__";
		const PRESETS = [
			{ key: "official", label: "官方壁纸", background: "url(\"" + PRESET_OFFICIAL_URL + "\")", brightness: 211 },
			{ key: "dark-grad", label: "深蓝渐变", background: "linear-gradient(180deg,#081a40 0%,#16315f 100%)", brightness: 30 },
			{ key: "light-grad", label: "浅蓝渐变", background: "linear-gradient(180deg,#f4f7fb 0%,#d0e8f8 100%)", brightness: 225 }
		];

		// ---- persistence ---------------------------------------------------
		const STORAGE_KEY = "dsh.customWallpaper.v1";
		const BALANCE_KEY = "dsh.customWallpaper.balanceVisible";

		function loadConfig() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (!raw) return null;
				const cfg = JSON.parse(raw);
				if (typeof cfg !== "object" || cfg === null) return null;
				return cfg;
			} catch {
				return null;
			}
		}
		function saveConfig(cfg) {
			try {
				if (cfg === null) localStorage.removeItem(STORAGE_KEY);
				else localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
			} catch {}
		}
		function balanceVisible() {
			try { return localStorage.getItem(BALANCE_KEY) === "1"; } catch { return false; }
		}
		function saveBalanceVisible(v) {
			try { localStorage.setItem(BALANCE_KEY, v ? "1" : "0"); } catch {}
		}
		// 卡片「余额显示」开关 ↔ 侧边栏常驻余额显示 的状态同步（同窗口内）
		const balanceSubs = new Set();
		function notifyBalanceVisible(v) {
			for (const fn of balanceSubs) { try { fn(v); } catch {} }
		}
		function subscribeBalanceVisible(fn) {
			balanceSubs.add(fn);
			return () => balanceSubs.delete(fn);
		}

		// ---- apply --------------------------------------------------------
		function currentWallpaper(cfg) {
			if (!cfg) return null;
			const dark = document.body.dataset.dsDarkTheme !== undefined;
			const wall = dark ? cfg.dark : cfg.light;
			if (wall && wall.background) return wall;
			return (dark ? cfg.light : cfg.dark) || null;
		}
		function applyWallpaper(cfg) {
			const body = document.body;
			const wall = currentWallpaper(cfg);
			if (!wall) {
				body.style.removeProperty("--cw-wallpaper");
				body.style.removeProperty("--cw-blur");
				body.style.removeProperty("--cw-opacity");
				delete body.dataset.customWallpaper;
				delete body.dataset.cwFont;
				return;
			}
			body.dataset.customWallpaper = "";
			body.style.setProperty("--cw-wallpaper", wall.background);
			body.style.setProperty("--cw-blur", (typeof cfg.blur === "number" ? cfg.blur : 0) + "px");
			body.style.setProperty("--cw-opacity", String(typeof cfg.opacity === "number" ? cfg.opacity : 0.85));
			const fontMode = cfg.fontMode || "auto";
			if (fontMode === "dark") body.dataset.cwFont = "dark";
			else if (fontMode === "light") body.dataset.cwFont = "light";
			else body.dataset.cwFont = (typeof wall.brightness === "number" && wall.brightness < 128) ? "dark" : "light";
		}

		// ---- image helpers ------------------------------------------------
		function compressImage(file, cb) {
			const img = new Image();
			const url = URL.createObjectURL(file);
			img.onload = () => {
				try {
					const maxW = 1920;
					const scale = Math.min(1, maxW / img.width);
					const w = Math.max(1, Math.round(img.width * scale));
					const hh = Math.max(1, Math.round(img.height * scale));
					const canvas = document.createElement("canvas");
					canvas.width = w;
					canvas.height = hh;
					const ctx2d = canvas.getContext("2d");
					ctx2d.drawImage(img, 0, 0, w, hh);
					let dataUrl = canvas.toDataURL("image/webp", 0.8);
					if (!dataUrl || dataUrl.indexOf("image/webp") !== 0) {
						dataUrl = canvas.toDataURL("image/jpeg", 0.82);
					}
					cb(dataUrl);
				} catch {
					cb(null);
				} finally {
					URL.revokeObjectURL(url);
				}
			};
			img.onerror = () => { URL.revokeObjectURL(url); cb(null); };
			img.src = url;
		}
		function computeBrightness(dataUrl, cb) {
			const img = new Image();
			img.onload = () => {
				try {
					const canvas = document.createElement("canvas");
					canvas.width = 32;
					canvas.height = 32;
					const ctx2d = canvas.getContext("2d");
					ctx2d.drawImage(img, 0, 0, 32, 32);
					const data = ctx2d.getImageData(0, 0, 32, 32).data;
					let sum = 0;
					for (let i = 0; i < data.length; i += 4) {
						sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
					}
					cb(sum / (32 * 32));
				} catch {
					cb(255);
				}
			};
			img.onerror = () => cb(255);
			img.src = dataUrl;
		}

		// ---- DSH-token control styles --------------------------------------
		const ctl = {
			appearance: "none", font: "inherit", cursor: "pointer",
			border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8,
			padding: "5px 14px", fontSize: 13, lineHeight: 1.5,
			color: "var(--dsw-alias-label-secondary)", background: "transparent"
		};
		const ctlActive = {
			...ctl, color: "var(--dsw-alias-label-primary)",
			borderColor: "var(--dsw-alias-label-dimmed)", background: "var(--dsw-alias-bg-layer-2)"
		};
		const ctlDanger = {
			...ctl, borderColor: "var(--dsw-alias-label-error, rgba(239,68,68,0.5))"
		};
		const ctlInput = {
			font: "inherit", fontSize: 13, padding: "3px 10px", borderRadius: 8,
			border: "1px solid var(--dsw-alias-border-l2)",
			color: "var(--dsw-alias-label-primary)", background: "var(--dsw-alias-bg-layer-2)"
		};

		// ---- settings card (wallpaper, official PluginCard chrome) ----------
		function SettingsCard() {
			const [cfg, setCfg] = react.useState(loadConfig);
			const [open, setOpen] = react.useState(false);
			const [themeTick, setThemeTick] = react.useState(0);
			const fileRef = react.useRef(null);

			// 跟随系统外观（应用自带浅色/深色/跟随系统设置，插件不自建亮暗切换）
			react.useEffect(() => {
				const mo = new MutationObserver(() => setThemeTick((t) => t + 1));
				mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
				return () => mo.disconnect();
			}, []);

			const update = (patch) => {
				const next = { ...(cfg || {}), ...patch };
				setCfg(next);
				saveConfig(next);
				applyWallpaper(next);
			};
			const setWallpaper = (background, brightness) => {
				const next = { ...(cfg || {}), [editing]: { background, brightness } };
				setCfg(next);
				saveConfig(next);
				applyWallpaper(next);
			};
			const onPickFile = (e) => {
				const file = e.target.files && e.target.files[0];
				e.target.value = "";
				if (!file) return;
				compressImage(file, (dataUrl) => {
					if (!dataUrl) return;
					computeBrightness(dataUrl, (brightness) => {
						setWallpaper("url(\"" + dataUrl + "\")", brightness);
					});
				});
			};
			const reset = () => { setCfg(null); saveConfig(null); applyWallpaper(null); };

			const row = (label, child) => h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "12px 0 10px" } },
				h("span", { style: { fontSize: 13, whiteSpace: "nowrap", flexShrink: 0, color: "var(--dsw-alias-label-secondary)" } }, label), child);

			const slider = (value, min, max, step, onChange, fmt) => h("div", { style: { display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 } },
				h("input", { type: "range", min, max, step, value, style: { flex: 1, minWidth: 60, accentColor: "var(--dsw-alias-brand-primary)" }, onChange: (e) => onChange(Number(e.target.value)) }),
				h("span", { style: { fontSize: 12, opacity: 0.7, minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums" } }, fmt(value)));

			const blur = cfg && typeof cfg.blur === "number" ? cfg.blur : 0;
			const opacity = cfg && typeof cfg.opacity === "number" ? cfg.opacity : 0.85;
			const dark = document.body.dataset.dsDarkTheme !== undefined;
			const editing = dark ? "dark" : "light";
			const editingLabel = dark ? "暗色" : "浅色";
			const currentWall = cfg ? (editing === "dark" ? cfg.dark : cfg.light) : null;
			const hasWall = !!(cfg && (cfg.light || cfg.dark));

			const presetRow = h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
				PRESETS.map((p) => h("button", { type: "button", key: p.key, onClick: () => setWallpaper(p.background, p.brightness), style: ctl }, p.label)));

			return h("li", { className: "YyYd_a_card" + (open ? " YyYd_a_cardOpen" : "") },
				h("button", {
					type: "button", className: "YyYd_a_header", "aria-expanded": open,
					"aria-label": (open ? "收起: " : "展开: ") + "自定义壁纸",
					onClick: () => setOpen(!open)
				},
					h("span", { className: "YyYd_a_headText" },
						h("span", { className: "YyYd_a_name" }, "自定义壁纸"),
						h("span", { className: "YyYd_a_description" }, "预设 / 上传壁纸，跟随系统外观（浅色/深色），支持毛玻璃、半透明与字体颜色联动")),
					h("span", { className: "YyYd_a_chevron" + (open ? " YyYd_a_chevronOpen" : "") }, "▾")),
				open ? h("div", { className: "YyYd_a_body" },
					row("当前主题", h("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)" } }, editingLabel)),
					row("预设壁纸", presetRow),
					row("上传图片", h("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
						h("button", { type: "button", onClick: () => fileRef.current && fileRef.current.click(), style: ctl }, "选择图片"),
						h("span", { style: { fontSize: 12, opacity: 0.7 } }, "应用到当前" + editingLabel + "主题"))),
					h("input", { ref: fileRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: onPickFile }),
					currentWall ? h("div", { style: { margin: "12px 0 4px" } },
						h("div", { style: { width: "100%", aspectRatio: "16/9", borderRadius: 8, backgroundImage: currentWall.background, backgroundPosition: "center", backgroundSize: "cover", border: "1px solid var(--dsw-alias-border-l2)" } }),
						h("span", { style: { fontSize: 12, opacity: 0.6 } }, "当前" + editingLabel + "壁纸预览")) : null,
					row("毛玻璃模糊", slider(blur, 0, 20, 1, (v) => update({ blur: v }), (v) => v + "px")),
					row("面板半透明", slider(opacity, 0.3, 1, 0.05, (v) => update({ opacity: v }), (v) => Math.round(v * 100) + "%")),
					row("字体颜色", h("select", {
						value: (cfg && cfg.fontMode) || "auto", style: ctlInput,
						onChange: (e) => update({ fontMode: e.target.value })
					},
						h("option", { value: "auto" }, "自动（跟随亮度）"),
						h("option", { value: "light" }, "浅色字体"),
						h("option", { value: "dark" }, "深色字体"))),
					row("余额显示", h(BalanceRow)),
					h("div", { className: "YyYd_a_footer" },
						hasWall ? h("button", { type: "button", className: "YyYd_a_discard", onClick: reset }, "恢复默认") : null)
				) : null
			);
		}

		// ---- balance: shared hook + card toggle + sidebar always-visible display -----
		function useBalance() {
			const [visible, setVisible] = react.useState(balanceVisible);
			const [balance, setBalance] = react.useState(null);
			const [state, setState] = react.useState("idle");

			const fetchBalance = () => {
				setState("loading");
				fetch("/api/custom-wallpaper/balance")
					.then((r) => r.json())
					.then((data) => {
						if (data && data.ok && data.data) {
							const infos = data.data.balance_infos || [];
							const cny = infos.find((b) => b.currency === "CNY") || infos[0];
							setBalance(cny ? cny.total_balance : null);
							setState("ok");
						} else {
							setBalance(null);
							setState(data && data.error === "no-api-key" ? "no-key" : "error");
						}
					})
					.catch(() => { setBalance(null); setState("error"); });
			};

			const fetchRef = react.useRef(fetchBalance);
			fetchRef.current = fetchBalance;

			react.useEffect(() => {
				if (!visible) { setBalance(null); setState("idle"); return; }
				fetchRef.current();
				const timer = window.setInterval(() => fetchRef.current(), 30000);
				return () => window.clearInterval(timer);
			}, [visible]);

			const toggle = (next) => {
				setVisible(next);
				saveBalanceVisible(next);
			};

			return { visible, toggle, balance, state };
		}

		function BalanceRow() {
			const { visible, toggle, balance, state } = useBalance();

			const isActive = state === "ok" && balance != null;
			const isError = state === "no-key" || state === "error";
			const hint = isActive ? "¥" + balance : (state === "loading" ? "获取中…" : (isError ? (state === "no-key" ? "未配置 API Key" : "获取失败") : ""));

			return h("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1, justifyContent: "flex-end" } },
				hint ? h("span", { style: { fontSize: 12, opacity: 0.7, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, hint) : null,
				h("div", { style: { display: "flex", gap: 6, flexShrink: 0 } },
					[["show", "显示"], ["hide", "隐藏"]].map(([k, label]) => h("button", {
						type: "button", key: k, onClick: () => {
							const next = k === "show";
							toggle(next);
							notifyBalanceVisible(next);
						},
						style: (k === "show" ? visible : !visible) ? ctlActive : ctl
					}, label))));
		}

		// 侧边栏底部常驻余额显示（纯展示文本，非按钮 → 无焦点环/黑边问题）
		function BalanceDisplay() {
			const { visible, toggle, balance, state } = useBalance();
			const visibleRef = react.useRef(visible);
			visibleRef.current = visible;
			react.useEffect(() => subscribeBalanceVisible((v) => {
				if (v === visibleRef.current) return;
				visibleRef.current = v;
				toggle(v);
			}), []);
			if (!visible) return null;

			const isActive = state === "ok" && balance != null;
			const isError = state === "no-key" || state === "error";
			const label = isActive ? "¥" + balance : (state === "loading" ? "余额…" : (isError ? (state === "no-key" ? "未配置Key" : "获取失败") : "余额"));

			return h("div", { style: {
				cursor: "default", userSelect: "none", font: "inherit", fontSize: 12, lineHeight: 1.5,
				textAlign: "center", whiteSpace: "nowrap",
				color: isActive ? "var(--dsw-alias-label-primary)" : (isError ? "var(--dsw-alias-label-error, #ef4444)" : "var(--dsw-alias-label-secondary)"),
				opacity: isActive ? 1 : 0.85
			} }, label);
		}

		// ---- plugin entry -------------------------------------------------
		const inject = ["slots"];

		function apply(ctx) {
			applyWallpaper(loadConfig());
			const themeObserver = new MutationObserver(() => applyWallpaper(loadConfig()));
			themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
			ctx.effect(() => {
				ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
					name: "settings.plugin.item",
					id: "custom-wallpaper",
					order: 100
				}, SettingsCard));
				ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
					name: "sidebar.footer.action",
					id: "custom-wallpaper-balance",
					order: 200
				}, BalanceDisplay));
			});
			ctx.effect(() => () => themeObserver.disconnect());
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
