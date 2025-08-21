INPUT=$1
OUTDIR=${2:-} 
BASENAME=$(basename "$INPUT" .lytex)

mkdir -p .lytex/
cd .lytex/

#must be an absolute path
lilypond-book --pdf $INPUT

#extract the name from the file path and look for a tex file like that
latexmk -pdf -pdflatex="pdflatex -halt-on-error -interaction=nonstopmode" -outdir=..$OUTDIR -auxdir=aux $BASENAME.tex
