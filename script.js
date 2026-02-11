let currentCode = null;

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  document.getElementById(id).style.display='block';
}

function gotoCodePage(){ showPage('code-page'); }

async function verifyCode(){
  const code = document.getElementById('code-input').value;
  const res = await fetch('/api/verify',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({code})
  });
  const data = await res.json();
  if(data.valid){
    currentCode = code;
    showPage('draw-page');
    updateStatus();
  } else {
    document.getElementById('code-msg').innerText = "驗證碼無效或已使用";
  }
}

async function draw(){
  if(!currentCode) return;
  const res = await fetch('/api/draw',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({code:currentCode})
  });
  const data = await res.json();
  if(data.success){
    document.getElementById('prize-name').innerText = `恭喜你抽到: ${data.prize}`;
    document.getElementById('draw-result').style.display='flex';
    document.getElementById('sound').play();
    updateStatus(data.remaining);
  } else alert(data.msg);
}

function closeResult(){ document.getElementById('draw-result').style.display='none'; }

function updateStatus(remaining=null){
  if(remaining){
    const status = remaining.map(p=>`${p.name}:${p.remaining}`).join(' | ');
    document.getElementById('status').innerText = "剩餘數量：" + status;
  }
}
