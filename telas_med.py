import json, time
from playwright.sync_api import sync_playwright
agora=int(time.time()*1000); D=86400000
med=[]
for i,(peso,cint) in enumerate([(84.2,92),(83.9,None),(83.5,91.5),(83.8,None),(83.1,90.8),(82.9,None),(82.6,90.2),(82.8,None),(82.3,89.6)]):
    v={"peso":peso}
    if cint: v.update({"cintura":cint,"abdomen":cint+4,"braco":37.5+i*0.1,"coxa":58,"gordura":19.5-i*0.2})
    med.append({"id":f"m{i}","t":agora-(40-i*5)*D,"valores":v})
dados={"custom":[],"cardio":[],"routines":[],"sessions":[],"active":None,"medidas":med,"meta":{"lastBackup":agora,"lastBackupCount":0}}
init="localStorage.setItem('treino:v1', %s);"%json.dumps(json.dumps(dados))
with sync_playwright() as p:
    nav=p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",args=["--no-sandbox"])
    ctx=nav.new_context(viewport={"width":390,"height":844},device_scale_factor=2,color_scheme="dark")
    ctx.add_init_script(init); pg=ctx.new_page(); erros=[]; pg.on("pageerror",lambda e:erros.append(str(e)))
    pg.goto("file://"+__import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__),"..","index.html"))+""); pg.wait_for_timeout(500)
    pg.locator('[data-act="nav"][data-v="medidas"]').click(); pg.wait_for_timeout(300)
    pg.locator('[data-act="abrirMedida"][data-k="peso"]').click(); pg.wait_for_timeout(300)
    pg.screenshot(path="/home/claude/telas/med_1.png")
    pg.locator('[data-act="novaMedida"]').click(); pg.wait_for_timeout(300)
    pg.screenshot(path="/home/claude/telas/med_2.png")
    pg.locator('.sheet button[data-act="fecharMedida"]').click(); pg.wait_for_timeout(200)
    pg.locator('[data-act="abrirCfgMed"]').click(); pg.wait_for_timeout(300)
    pg.screenshot(path="/home/claude/telas/med_3.png")
    print("erros:", erros or "nenhum"); nav.close()
