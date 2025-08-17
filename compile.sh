INPUT=$1
OUTDIR=${2:-} 

mkdir -p .lytex/
cd .lytex/

lilypond-book --pdf ../$INPUT

latexmk -pdf -pdflatex="pdflatex -halt-on-error -interaction=nonstopmode" -outdir=..$OUTDIR -auxdir=aux example.tex 