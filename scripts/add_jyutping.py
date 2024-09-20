#!/usr/bin/env python3
"""
A helper script that adds jyutping to the standard Chinese dictionary.
Simply specify a CEDICT dictionary as input, and use a different file for output.
"""
import jyutping
import argparse
import re

parser = argparse.ArgumentParser(description='Adds jyutping to all entries in the standard Chinese dictionary')
parser.add_argument('--input', dest='inputPath', help='Input dictionary file')
parser.add_argument('--output', dest='outputPath', help='Output dictionary file')
args = parser.parse_args()

def convert_line(line):
    characters = line.split(" ")[0]
    pronunciation = jyutping.get(characters)
    if None in pronunciation:
        pronunciation = []

    for i in range(len(pronunciation)):
        if isinstance(pronunciation[i], list):
            pronunciation[i] = "/".join(pronunciation[i])

    replPattern = r"\1 \2 [\3] {{{0}}} /\4/".format(" ".join(pronunciation))
    newLine = re.sub(r"(.+?) (.+?) \[(.+?)\] \/(.+)\/", replPattern, line)

    # This way we can re-run on an existing dictionary to update the existing entries
    # if the first sub did not do anything. Otherwise the entry should be the same
    newLine = re.sub(r"(.+?) (.+?) \[(.+?)\] {.*?} \/(.+)\/", replPattern, newLine)
    return newLine

if __name__ == '__main__':
    with open(args.inputPath) as input:
        with open(args.outputPath, "w+") as output:
            lines = input.readlines()

            for line in lines:
                output.write(convert_line(line))
