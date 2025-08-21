#!/bin/bash
(
    #must be an absolute path
    INPUT=$1
    OUTDIR=${2:-} 
    BASENAME=$(basename "$INPUT" .lytex)
    INPUTDIR=$(dirname "$INPUT")

    cd $INPUTDIR

    mkdir -p .lytex/
    cd .lytex/

    #prints errors but not verbose progress
    lilypond-book --pdf "$INPUT" 2>&1 | grep -E "(error|Error|ERROR)"

    #extract the name from the file path and look for a tex file like that
    latexmk -pdf -pdflatex="pdflatex -halt-on-error -interaction=nonstopmode" -outdir=..$OUTDIR -auxdir=aux $BASENAME.tex
)