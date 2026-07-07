// Copyright (c) 2024-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <consensus/params.h>
#include <deploymentinfo.h>
#include <test/util/setup_common.h>

#include <optional>
#include <string>

#include <boost/test/unit_test.hpp>

BOOST_AUTO_TEST_SUITE(deploymentinfo_tests)

BOOST_AUTO_TEST_CASE(deployment_name_buried)
{
    BOOST_CHECK_EQUAL(DeploymentName(Consensus::DEPLOYMENT_HEIGHTINCB), "bip34");
    BOOST_CHECK_EQUAL(DeploymentName(Consensus::DEPLOYMENT_CLTV), "bip65");
    BOOST_CHECK_EQUAL(DeploymentName(Consensus::DEPLOYMENT_DERSIG), "bip66");
    BOOST_CHECK_EQUAL(DeploymentName(Consensus::DEPLOYMENT_CSV), "csv");
    BOOST_CHECK_EQUAL(DeploymentName(Consensus::DEPLOYMENT_SEGWIT), "segwit");
}

BOOST_AUTO_TEST_CASE(deployment_name_versionbits)
{
    BOOST_CHECK_EQUAL(DeploymentName(Consensus::DEPLOYMENT_TESTDUMMY), "testdummy");
}

BOOST_AUTO_TEST_CASE(get_buried_deployment_valid)
{
    BOOST_CHECK(GetBuriedDeployment("segwit") == Consensus::DEPLOYMENT_SEGWIT);
    BOOST_CHECK(GetBuriedDeployment("bip34") == Consensus::DEPLOYMENT_HEIGHTINCB);
    BOOST_CHECK(GetBuriedDeployment("dersig") == Consensus::DEPLOYMENT_DERSIG);
    BOOST_CHECK(GetBuriedDeployment("cltv") == Consensus::DEPLOYMENT_CLTV);
    BOOST_CHECK(GetBuriedDeployment("csv") == Consensus::DEPLOYMENT_CSV);
}

BOOST_AUTO_TEST_CASE(get_buried_deployment_invalid)
{
    BOOST_CHECK(GetBuriedDeployment("") == std::nullopt);
    BOOST_CHECK(GetBuriedDeployment("nonexistent") == std::nullopt);
    BOOST_CHECK(GetBuriedDeployment("Segwit") == std::nullopt);
    BOOST_CHECK(GetBuriedDeployment("SEGWIT") == std::nullopt);
    BOOST_CHECK(GetBuriedDeployment("testdummy") == std::nullopt);
    BOOST_CHECK(GetBuriedDeployment("bip65") == std::nullopt);
    BOOST_CHECK(GetBuriedDeployment("bip66") == std::nullopt);
}

BOOST_AUTO_TEST_CASE(deployment_name_buried_roundtrip)
{
    // For buried deployments, verify the naming is consistent by checking
    // known name -> deployment -> name conversions.
    const std::vector<std::pair<std::string, Consensus::BuriedDeployment>> known = {
        {"segwit", Consensus::DEPLOYMENT_SEGWIT},
        {"bip34", Consensus::DEPLOYMENT_HEIGHTINCB},
        {"csv", Consensus::DEPLOYMENT_CSV},
        {"cltv", Consensus::DEPLOYMENT_CLTV},
        {"dersig", Consensus::DEPLOYMENT_DERSIG},
    };

    for (const auto& [name, dep] : known) {
        // GetBuriedDeployment(name) -> dep
        auto result = GetBuriedDeployment(name);
        BOOST_CHECK(result.has_value());
        BOOST_CHECK(result.value() == dep);

        // DeploymentName(dep) -> expected name (note: dersig maps to bip66)
        std::string dep_name = DeploymentName(dep);
        if (name == "dersig") {
            BOOST_CHECK_EQUAL(dep_name, "bip66");
        } else if (name == "cltv") {
            BOOST_CHECK_EQUAL(dep_name, "bip65");
        } else if (name == "bip34") {
            BOOST_CHECK_EQUAL(dep_name, "bip34");
        } else {
            BOOST_CHECK_EQUAL(dep_name, name);
        }
    }
}

BOOST_AUTO_TEST_CASE(vbdeploymentinfo_fields)
{
    BOOST_CHECK_EQUAL(std::string(VersionBitsDeploymentInfo[Consensus::DEPLOYMENT_TESTDUMMY].name), "testdummy");
    BOOST_CHECK_EQUAL(VersionBitsDeploymentInfo[Consensus::DEPLOYMENT_TESTDUMMY].gbt_optional_rule, true);
}

BOOST_AUTO_TEST_SUITE_END()
