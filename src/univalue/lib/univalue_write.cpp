// Copyright 2014 BitPay Inc.
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/licenses/mit-license.php.

#include <univalue.h>
#include <univalue_escapes.h>

#include <string>
#include <vector>

static std::string json_escape(const std::string& inS)
{
    std::string outS;
    outS.reserve(inS.size() * 2);

    for (unsigned int i = 0; i < inS.size(); i++) {
        unsigned char ch = static_cast<unsigned char>(inS[i]);
        const char *escStr = escapes[ch];

        if (escStr)
            outS += escStr;
        else
            outS += static_cast<char>(ch);
    }

    return outS;
}

// NOLINTNEXTLINE(misc-no-recursion)
std::string UniValue::write(Indentation indentation,
                            unsigned int indentLevel) const
{
    std::string s;
    s.reserve(1024);

    unsigned int modIndent = indentLevel;
    if (modIndent == 0)
        modIndent = 1;

    switch (typ) {
    case VNULL:
        s += "null";
        break;
    case VOBJ:
        writeObject(indentation, modIndent, s);
        break;
    case VARR:
        writeArray(indentation, modIndent, s);
        break;
    case VSTR:
        s += "\"" + json_escape(val) + "\"";
        break;
    case VNUM:
        s += val;
        break;
    case VBOOL:
        s += (val == "1" ? "true" : "false");
        break;
    }

    return s;
}

static void indentStr(Indentation indentation, unsigned int indentLevel, std::string& s)
{
    if (indentation.useTabs) {
        s.append(indentLevel, '\t');
    } else {
        s.append(indentation.size * indentLevel, ' ');
    }
}

// NOLINTNEXTLINE(misc-no-recursion)
void UniValue::writeArray(Indentation indentation, unsigned int indentLevel, std::string& s) const
{
    s += "[";
    if (indentation.enabled())
        s += "\n";

    for (unsigned int i = 0; i < values.size(); i++) {
        if (indentation.enabled())
            indentStr(indentation, indentLevel, s);
        s += values[i].write(indentation, indentLevel + 1);
        if (i != (values.size() - 1)) {
            s += ",";
        }
        if (indentation.enabled())
            s += "\n";
    }

    if (indentation.enabled())
        indentStr(indentation, indentLevel - 1, s);
    s += "]";
}

// NOLINTNEXTLINE(misc-no-recursion)
void UniValue::writeObject(Indentation indentation, unsigned int indentLevel, std::string& s) const
{
    s += "{";
    if (indentation.enabled())
        s += "\n";

    for (unsigned int i = 0; i < keys.size(); i++) {
        if (indentation.enabled())
            indentStr(indentation, indentLevel, s);
        s += "\"" + json_escape(keys[i]) + "\":";
        if (indentation.enabled())
            s += " ";
        s += values.at(i).write(indentation, indentLevel + 1);
        if (i != (values.size() - 1))
            s += ",";
        if (indentation.enabled())
            s += "\n";
    }

    if (indentation.enabled())
        indentStr(indentation, indentLevel - 1, s);
    s += "}";
}

