import json, time, sys
from playwright.sync_api import sync_playwright
import os; ARQ = sys.argv[1] if len(sys.argv)>1 else os.path.abspath(os.path.join(os.path.dirname(__file__),"..","index.html"))
agora = int(time.time()*1000)
exs = ["supino_reto_com_barra","supino_inclinado_com_halteres","desenvolvimento_com_halteres","eleva_o_lateral","tr_ceps_na_polia_com_corda"]
sess = []
for i in range(9):
    t = agora - (i+1)*86400000*2
    sess.append({"id":f"s{i}","routineId":["rA","rB","rC"][i%3],"name":["Push","Pull","Legs"][i%3],"start":t,"end":t+3600000,
      "entries":[{"exId":"supino_reto_com_barra","maquina":"Technogym" if i%2 else "","note":"",
                  "sets":[{"w":60+i,"r":10,"done":True},{"w":62+i,"r":9,"done":True},{"w":65+i,"r":8,"done":True}]},
                 {"exId":"desenvolvimento_com_halteres","note":"","maquina":"","sets":[{"w":20,"r":12,"done":True},{"w":22,"r":10,"done":True}]}]})
dados = {"custom":[],"cardio":[{"id":"c1","tipo":"Bicicleta ergométrica","min":30,"km":8.88,"intensidade":"Moderado","nota":"Nível 8","t":agora-3600000}],
  "routines":[{"id":"rA","name":"Push","items":[{"exId":"supino_reto_com_barra","sets":3,"reps":"8-12","rest":90,"padraoTipos":{"A":1,"P":0}},
                                               {"exId":"desenvolvimento_com_halteres","sets":3,"reps":"8-12","rest":90}]},
              {"id":"rB","name":"Pull","items":[{"exId":"barra_fixa","sets":3,"reps":"6-10","rest":120}]},
              {"id":"rC","name":"Legs","items":[{"exId":"agachamento_livre","sets":4,"reps":"6-10","rest":150}]}],
  "sessions":sess,"active":None,"meta":{"lastBackup":agora,"lastBackupCount":9}}
init = "localStorage.setItem('treino:v1', %s);" % json.dumps(json.dumps(dados))

def clicar(pg, sel, i=0):
    el = pg.locator(sel).nth(i); el.click(); pg.wait_for_timeout(250)

with sync_playwright() as p:
    nav = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--no-sandbox"])
    for tema in ["dark","light"]:
        ctx = nav.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, color_scheme=tema)
        ctx.add_init_script(init)
        pg = ctx.new_page(); erros=[]
        pg.on("pageerror", lambda e: erros.append(str(e)))
        pg.goto("file://"+ARQ); pg.wait_for_timeout(600)
        pre=f"/home/claude/telas/{tema}_"
        pg.screenshot(path=pre+"01_treino.png")
        if tema=="dark":
            clicar(pg,'[data-act="start"]'); pg.screenshot(path=pre+"02_foco.png")
            clicar(pg,'[data-act="exMenu"]'); pg.screenshot(path=pre+"03_menu.png", full_page=False)
            clicar(pg,'.sheet button[data-act="fecharMenu"]')
            clicar(pg,'[data-act="modoLista"]'); pg.screenshot(path=pre+"04_lista.png")
            clicar(pg,'[data-act="voltarTreino"]')
            clicar(pg,'[data-act="nav"][data-v="historico"]'); clicar(pg,'[data-act="openSession"]'); pg.screenshot(path=pre+"05_historico.png")
            clicar(pg,'[data-act="nav"][data-v="progresso"]'); pg.screenshot(path=pre+"06_progresso.png")
            clicar(pg,'[data-act="nav"][data-v="cardio"]'); pg.screenshot(path=pre+"07_cardio.png")
            clicar(pg,'[data-act="novoCardio"]'); pg.screenshot(path=pre+"08_cardio_form.png")
            clicar(pg,'.sheet button[data-act="fecharCardio"]')
            clicar(pg,'[data-act="nav"][data-v="treinar"]'); clicar(pg,'[data-act="abrirCal"]'); pg.screenshot(path=pre+"09_calendario.png")
            clicar(pg,'[data-act="voltarConfig"]'); clicar(pg,'[data-act="abrirAssistente"]'); pg.screenshot(path=pre+"10_assistente.png")
        print(tema, "erros de página:", erros or "nenhum")
        ctx.close()
    nav.close()
