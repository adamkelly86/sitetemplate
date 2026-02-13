// Amount selector: sync range + number and update payment links — supports pence
(function(){
	const range = document.getElementById('amountRange');
	const number = document.getElementById('amountNumber');
	// find all anchors that expose a base URL via `data-base`
	const payLinks = Array.from(document.querySelectorAll('a[data-base]'));
	if(!range || !number) return;
	function clamp(v){
		v = parseFloat(v);
		if(isNaN(v)) return 1.00;
		v = Math.round(v*100)/100; // 2 decimal places
		if(v<1) return 1.00;
		if(v>250) return 250.00;
		return v;
	}
	function updateLinks(v){
		v = clamp(v);
		v = Number(v).toFixed(2);
		range.value = v; number.value = v;
		// construct hrefs from each element's data-base — handle common providers
		payLinks.forEach(link => {
			const baseRaw = link.getAttribute('data-base') || '';
			const baseLower = baseRaw.toLowerCase();
			// PayPal/Monzo: amount as trailing path segment
			if(baseLower.includes('paypalme') || baseLower.includes('monzo.me')){
				const base = baseRaw.replace(/\/$/,'');
				link.href = base + '/' + encodeURIComponent(v);
				return;
			}
			// Starling settle-up: amount as query param + currency
			if(baseLower.includes('settleup.starlingbank') || baseLower.includes('starlingbank')){
				const base = baseRaw.replace(/\/?$/,'');
				link.href = base + '?amount=' + encodeURIComponent(v) + '&currency=GBP';
				return;
			}
			// default: append amount as query param
			const base = baseRaw.replace(/\/?$/,'');
			const sep = base.includes('?') ? '&' : '?';
			link.href = base + sep + 'amount=' + encodeURIComponent(v);
		});
		// keep the URL in sync (update ?amount without reloading)
		try{
			const p = new URLSearchParams(window.location.search);
			p.set('amount', String(v));
			const newUrl = window.location.pathname + (p.toString() ? '?' + p.toString() : '') + window.location.hash;
			history.replaceState(null, '', newUrl);
		}catch(e){/* ignore */}
	}
	// init: honour ?amount= or trailing numeric path segment (supports 2 decimal places)
	(function(){
		const params = new URLSearchParams(window.location.search);
		let initAmount = number.value;
		if(params.has('amount')){
			initAmount = clamp(params.get('amount'));
		}else{
			const m = window.location.pathname.match(/\/(\d{1,3}(?:\.\d{1,2})?)\/?$/);
			if(m) initAmount = clamp(m[1]);
		}
		updateLinks(initAmount);
	})();
	range.addEventListener('input', e => updateLinks(e.target.value));
	// Only update from the number input when the user finishes typing (blur) or presses Enter.
	number.addEventListener('blur', e => {
		const v = e.target.value;
		if (v === '' || v == null) {
			// default to £5.00 when empty
			updateLinks(5.00);
		} else {
			updateLinks(v);
		}
	});
	// Pressing Enter will commit the value (by blurring the input).
	number.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			e.preventDefault();
			number.blur();
		}
	});
})();
