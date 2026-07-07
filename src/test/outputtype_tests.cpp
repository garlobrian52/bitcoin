// Copyright (c) 2024-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <addresstype.h>
#include <outputtype.h>
#include <test/util/setup_common.h>

#include <optional>
#include <string>

#include <boost/test/unit_test.hpp>

BOOST_FIXTURE_TEST_SUITE(outputtype_tests, BasicTestingSetup)

BOOST_AUTO_TEST_CASE(parse_output_type)
{
    BOOST_CHECK(ParseOutputType("legacy") == OutputType::LEGACY);
    BOOST_CHECK(ParseOutputType("p2sh-segwit") == OutputType::P2SH_SEGWIT);
    BOOST_CHECK(ParseOutputType("bech32") == OutputType::BECH32);
    BOOST_CHECK(ParseOutputType("bech32m") == OutputType::BECH32M);

    BOOST_CHECK(ParseOutputType("") == std::nullopt);
    BOOST_CHECK(ParseOutputType("Legacy") == std::nullopt);
    BOOST_CHECK(ParseOutputType("LEGACY") == std::nullopt);
    BOOST_CHECK(ParseOutputType("invalid") == std::nullopt);
    BOOST_CHECK(ParseOutputType("bech33") == std::nullopt);
    BOOST_CHECK(ParseOutputType("unknown") == std::nullopt);
}

BOOST_AUTO_TEST_CASE(format_output_type)
{
    BOOST_CHECK_EQUAL(FormatOutputType(OutputType::LEGACY), "legacy");
    BOOST_CHECK_EQUAL(FormatOutputType(OutputType::P2SH_SEGWIT), "p2sh-segwit");
    BOOST_CHECK_EQUAL(FormatOutputType(OutputType::BECH32), "bech32");
    BOOST_CHECK_EQUAL(FormatOutputType(OutputType::BECH32M), "bech32m");
    BOOST_CHECK_EQUAL(FormatOutputType(OutputType::UNKNOWN), "unknown");
}

BOOST_AUTO_TEST_CASE(format_output_type_roundtrip)
{
    for (const auto& type : OUTPUT_TYPES) {
        const std::string& str = FormatOutputType(type);
        auto parsed = ParseOutputType(str);
        BOOST_CHECK(parsed.has_value());
        BOOST_CHECK(parsed.value() == type);
    }
}

BOOST_AUTO_TEST_CASE(format_all_output_types)
{
    const std::string all = FormatAllOutputTypes();
    BOOST_CHECK(all.find("\"legacy\"") != std::string::npos);
    BOOST_CHECK(all.find("\"p2sh-segwit\"") != std::string::npos);
    BOOST_CHECK(all.find("\"bech32\"") != std::string::npos);
    BOOST_CHECK(all.find("\"bech32m\"") != std::string::npos);
    BOOST_CHECK(all.find("\"unknown\"") == std::string::npos);
}

BOOST_AUTO_TEST_CASE(output_type_from_destination)
{
    // PKHash -> LEGACY
    BOOST_CHECK(OutputTypeFromDestination(PKHash{uint160{}}) == OutputType::LEGACY);

    // ScriptHash -> LEGACY
    BOOST_CHECK(OutputTypeFromDestination(ScriptHash{uint160{}}) == OutputType::LEGACY);

    // WitnessV0KeyHash -> BECH32
    BOOST_CHECK(OutputTypeFromDestination(WitnessV0KeyHash{uint160{}}) == OutputType::BECH32);

    // WitnessV0ScriptHash -> BECH32
    BOOST_CHECK(OutputTypeFromDestination(WitnessV0ScriptHash{uint256{}}) == OutputType::BECH32);

    // WitnessV1Taproot -> BECH32M
    BOOST_CHECK(OutputTypeFromDestination(WitnessV1Taproot{XOnlyPubKey{}}) == OutputType::BECH32M);

    // WitnessUnknown -> BECH32M
    BOOST_CHECK(OutputTypeFromDestination(WitnessUnknown{2, std::vector<unsigned char>(32, 0)}) == OutputType::BECH32M);

    // CNoDestination -> nullopt
    BOOST_CHECK(OutputTypeFromDestination(CNoDestination{}) == std::nullopt);

    // PubKeyDestination -> nullopt
    BOOST_CHECK(OutputTypeFromDestination(PubKeyDestination{CPubKey{}}) == std::nullopt);

    // PayToAnchor -> nullopt (distinct variant from WitnessUnknown)
    BOOST_CHECK(OutputTypeFromDestination(PayToAnchor{}) == std::nullopt);
}

BOOST_AUTO_TEST_SUITE_END()
