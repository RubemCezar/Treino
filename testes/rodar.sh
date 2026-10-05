#!/bin/sh
# Roda a suíte inteira contra ../index.html. Requer: npm install jsdom
cd "$(dirname "$0")"
tot=0; falhou=""
for f in test_*.js; do
  r=$(node "$f" 2>&1 | grep -v scrollTo | tail -1)
  n=$(echo "$r" | grep -o '^[0-9]*'); tot=$((tot+${n:-0}))
  case "$r" in *", 0 falhas") ;; *) falhou="$falhou $f";; esac
  printf "%-26s %s\n" "$f" "$r"
done
echo "TOTAL: $tot verificações"; [ -n "$falhou" ] && echo "FALHARAM:$falhou" || echo "0 falhas"
for s in 1 2 3; do node fuzz.js ../index.html 700 $s; done
