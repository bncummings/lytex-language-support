INPUT=$1
OUTDIR=${2:-} 

mkdir -p .lytex/
cd .lytex/

lilypond-book --pdf ../$INPUT

latexmk -pdf -outdir=..$OUTDIR -auxdir=aux example.tex 