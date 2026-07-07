// Copyright (c) 2024-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <addresstype.h>
#include <key.h>
#include <pubkey.h>
#include <script/script.h>
#include <test/util/random.h>
#include <test/util/setup_common.h>
#include <uint256.h>

#include <variant>
#include <vector>

#include <boost/test/unit_test.hpp>

BOOST_FIXTURE_TEST_SUITE(addresstype_tests, BasicTestingSetup)

BOOST_AUTO_TEST_CASE(is_valid_destination)
{
    // Invalid destinations
    BOOST_CHECK(!IsValidDestination(CNoDestination{}));
    BOOST_CHECK(!IsValidDestination(CNoDestination{CScript()}));
    BOOST_CHECK(!IsValidDestination(PubKeyDestination{CPubKey{}}));

    // Valid destinations
    BOOST_CHECK(IsValidDestination(PKHash{uint160{}}));
    BOOST_CHECK(IsValidDestination(ScriptHash{uint160{}}));
    BOOST_CHECK(IsValidDestination(WitnessV0KeyHash{uint160{}}));
    BOOST_CHECK(IsValidDestination(WitnessV0ScriptHash{uint256{}}));
    BOOST_CHECK(IsValidDestination(WitnessV1Taproot{XOnlyPubKey{}}));
    BOOST_CHECK(IsValidDestination(WitnessUnknown{2, std::vector<unsigned char>(32, 0)}));
}

BOOST_AUTO_TEST_CASE(pay_to_anchor)
{
    PayToAnchor anchor;
    BOOST_CHECK_EQUAL(anchor.GetWitnessVersion(), 1U);
    BOOST_CHECK(anchor.GetWitnessProgram() == ANCHOR_BYTES);
    BOOST_CHECK(IsValidDestination(anchor));
}

BOOST_AUTO_TEST_CASE(witness_unknown_equality)
{
    std::vector<unsigned char> prog1(32, 0x01);
    std::vector<unsigned char> prog2(32, 0x02);

    WitnessUnknown w1(2, prog1);
    WitnessUnknown w2(2, prog1);
    WitnessUnknown w3(3, prog1);
    WitnessUnknown w4(2, prog2);

    BOOST_CHECK(w1 == w2);
    BOOST_CHECK(!(w1 == w3));
    BOOST_CHECK(!(w1 == w4));
}

BOOST_AUTO_TEST_CASE(witness_unknown_less_than)
{
    std::vector<unsigned char> prog1(32, 0x01);
    std::vector<unsigned char> prog2(32, 0x02);

    WitnessUnknown w1(2, prog1);
    WitnessUnknown w2(3, prog1);
    WitnessUnknown w3(2, prog2);

    BOOST_CHECK(w1 < w2);
    BOOST_CHECK(!(w2 < w1));
    BOOST_CHECK(w1 < w3);
    BOOST_CHECK(!(w3 < w1));
}

BOOST_AUTO_TEST_CASE(cno_destination_equality)
{
    CScript script1;
    script1 << OP_RETURN;
    CScript script2;
    script2 << OP_TRUE;

    CNoDestination d1;
    CNoDestination d2;
    CNoDestination d3(script1);
    CNoDestination d4(script1);
    CNoDestination d5(script2);

    BOOST_CHECK(d1 == d2);
    BOOST_CHECK(d3 == d4);
    BOOST_CHECK(!(d1 == d3));
    BOOST_CHECK(!(d3 == d5));
}

BOOST_AUTO_TEST_CASE(extract_destination_p2pkh)
{
    CKey key = GenerateRandomKey();
    CPubKey pubkey = key.GetPubKey();

    CScript script = CScript() << OP_DUP << OP_HASH160 << ToByteVector(pubkey.GetID()) << OP_EQUALVERIFY << OP_CHECKSIG;

    CTxDestination dest;
    BOOST_CHECK(ExtractDestination(script, dest));
    BOOST_CHECK(std::holds_alternative<PKHash>(dest));
}

BOOST_AUTO_TEST_CASE(extract_destination_p2sh)
{
    CScript redeemScript;
    redeemScript << OP_TRUE;

    CScript script = CScript() << OP_HASH160 << ToByteVector(CScriptID(redeemScript)) << OP_EQUAL;

    CTxDestination dest;
    BOOST_CHECK(ExtractDestination(script, dest));
    BOOST_CHECK(std::holds_alternative<ScriptHash>(dest));
}

BOOST_AUTO_TEST_CASE(extract_destination_p2wpkh)
{
    CKey key = GenerateRandomKey();
    CPubKey pubkey = key.GetPubKey();

    CScript script = CScript() << OP_0 << ToByteVector(pubkey.GetID());

    CTxDestination dest;
    BOOST_CHECK(ExtractDestination(script, dest));
    BOOST_CHECK(std::holds_alternative<WitnessV0KeyHash>(dest));
}

BOOST_AUTO_TEST_CASE(extract_destination_nonstandard)
{
    CScript script;
    script << OP_TRUE << OP_TRUE;

    CTxDestination dest;
    BOOST_CHECK(!ExtractDestination(script, dest));
    BOOST_CHECK(std::holds_alternative<CNoDestination>(dest));
}

BOOST_AUTO_TEST_CASE(extract_destination_null_data)
{
    CScript script;
    script << OP_RETURN << std::vector<unsigned char>{0x01, 0x02, 0x03};

    CTxDestination dest;
    BOOST_CHECK(!ExtractDestination(script, dest));
    BOOST_CHECK(std::holds_alternative<CNoDestination>(dest));
}

BOOST_AUTO_TEST_CASE(get_script_for_destination_p2pkh)
{
    uint160 hash;
    PKHash pkhash(hash);
    CScript script = GetScriptForDestination(pkhash);
    BOOST_CHECK_EQUAL(script.size(), 25U);
    BOOST_CHECK_EQUAL(script[0], OP_DUP);
    BOOST_CHECK_EQUAL(script[1], OP_HASH160);
    BOOST_CHECK_EQUAL(script[23], OP_EQUALVERIFY);
    BOOST_CHECK_EQUAL(script[24], OP_CHECKSIG);
}

BOOST_AUTO_TEST_CASE(get_script_for_destination_p2sh)
{
    uint160 hash;
    ScriptHash sh(hash);
    CScript script = GetScriptForDestination(sh);
    BOOST_CHECK_EQUAL(script.size(), 23U);
    BOOST_CHECK_EQUAL(script[0], OP_HASH160);
    BOOST_CHECK_EQUAL(script[22], OP_EQUAL);
}

BOOST_AUTO_TEST_CASE(get_script_for_destination_p2wpkh)
{
    uint160 hash;
    WitnessV0KeyHash wkh(hash);
    CScript script = GetScriptForDestination(wkh);
    BOOST_CHECK_EQUAL(script.size(), 22U);
    BOOST_CHECK_EQUAL(script[0], OP_0);
}

BOOST_AUTO_TEST_CASE(get_script_for_destination_p2wsh)
{
    uint256 hash;
    WitnessV0ScriptHash wsh(hash);
    CScript script = GetScriptForDestination(wsh);
    BOOST_CHECK_EQUAL(script.size(), 34U);
    BOOST_CHECK_EQUAL(script[0], OP_0);
}

BOOST_AUTO_TEST_CASE(get_script_for_destination_nodest)
{
    CNoDestination nodest;
    CScript script = GetScriptForDestination(nodest);
    BOOST_CHECK(script.empty());
}

BOOST_AUTO_TEST_CASE(get_script_for_destination_nodest_with_script)
{
    CScript original;
    original << OP_RETURN << std::vector<unsigned char>{0xde, 0xad};
    CNoDestination nodest(original);
    CScript script = GetScriptForDestination(nodest);
    BOOST_CHECK(script == original);
}

BOOST_AUTO_TEST_CASE(extract_and_get_script_roundtrip)
{
    CKey key = GenerateRandomKey();
    CPubKey pubkey = key.GetPubKey();

    // P2PKH roundtrip
    CScript p2pkh = CScript() << OP_DUP << OP_HASH160 << ToByteVector(pubkey.GetID()) << OP_EQUALVERIFY << OP_CHECKSIG;
    CTxDestination dest;
    BOOST_CHECK(ExtractDestination(p2pkh, dest));
    CScript reconstructed = GetScriptForDestination(dest);
    BOOST_CHECK(reconstructed == p2pkh);

    // P2WPKH roundtrip
    CScript p2wpkh = CScript() << OP_0 << ToByteVector(pubkey.GetID());
    BOOST_CHECK(ExtractDestination(p2wpkh, dest));
    reconstructed = GetScriptForDestination(dest);
    BOOST_CHECK(reconstructed == p2wpkh);
}

BOOST_AUTO_TEST_CASE(pkhash_from_pubkey)
{
    CKey key = GenerateRandomKey();
    CPubKey pubkey = key.GetPubKey();

    PKHash pkhash(pubkey);
    CKeyID keyid = ToKeyID(pkhash);
    BOOST_CHECK(keyid == pubkey.GetID());
}

BOOST_AUTO_TEST_CASE(witness_v0_keyhash_from_pubkey)
{
    CKey key = GenerateRandomKey();
    CPubKey pubkey = key.GetPubKey();

    WitnessV0KeyHash wkh(pubkey);
    CKeyID keyid = ToKeyID(wkh);
    BOOST_CHECK(keyid == pubkey.GetID());
}

BOOST_AUTO_TEST_CASE(script_hash_from_script)
{
    CScript redeemScript;
    redeemScript << OP_TRUE;

    ScriptHash sh(redeemScript);
    CScriptID scriptid = ToScriptID(sh);
    BOOST_CHECK(scriptid == CScriptID(redeemScript));
}

BOOST_AUTO_TEST_SUITE_END()
