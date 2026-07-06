// Copyright (c) 2024-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <net_permissions.h>
#include <test/util/setup_common.h>
#include <util/translation.h>

#include <string>
#include <vector>

#include <boost/test/unit_test.hpp>

BOOST_FIXTURE_TEST_SUITE(net_permissions_tests, BasicTestingSetup)

BOOST_AUTO_TEST_CASE(has_flag_none)
{
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::None, NetPermissionFlags::None));
    BOOST_CHECK(!NetPermissions::HasFlag(NetPermissionFlags::None, NetPermissionFlags::BloomFilter));
    BOOST_CHECK(!NetPermissions::HasFlag(NetPermissionFlags::None, NetPermissionFlags::Relay));
}

BOOST_AUTO_TEST_CASE(has_flag_single)
{
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::BloomFilter, NetPermissionFlags::BloomFilter));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::Relay, NetPermissionFlags::Relay));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::Mempool, NetPermissionFlags::Mempool));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::Download, NetPermissionFlags::Download));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::Addr, NetPermissionFlags::Addr));
}

BOOST_AUTO_TEST_CASE(has_flag_combined)
{
    // ForceRelay implies Relay
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::ForceRelay, NetPermissionFlags::Relay));
    // NoBan implies Download
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::NoBan, NetPermissionFlags::Download));
}

BOOST_AUTO_TEST_CASE(has_flag_all)
{
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::All, NetPermissionFlags::BloomFilter));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::All, NetPermissionFlags::ForceRelay));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::All, NetPermissionFlags::Relay));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::All, NetPermissionFlags::NoBan));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::All, NetPermissionFlags::Mempool));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::All, NetPermissionFlags::Download));
    BOOST_CHECK(NetPermissions::HasFlag(NetPermissionFlags::All, NetPermissionFlags::Addr));
}

BOOST_AUTO_TEST_CASE(add_flag)
{
    NetPermissionFlags flags = NetPermissionFlags::None;
    BOOST_CHECK(!NetPermissions::HasFlag(flags, NetPermissionFlags::BloomFilter));

    NetPermissions::AddFlag(flags, NetPermissionFlags::BloomFilter);
    BOOST_CHECK(NetPermissions::HasFlag(flags, NetPermissionFlags::BloomFilter));

    NetPermissions::AddFlag(flags, NetPermissionFlags::Relay);
    BOOST_CHECK(NetPermissions::HasFlag(flags, NetPermissionFlags::BloomFilter));
    BOOST_CHECK(NetPermissions::HasFlag(flags, NetPermissionFlags::Relay));
}

BOOST_AUTO_TEST_CASE(clear_flag_implicit)
{
    NetPermissionFlags flags = NetPermissionFlags::Implicit;
    BOOST_CHECK(NetPermissions::HasFlag(flags, NetPermissionFlags::Implicit));

    NetPermissions::ClearFlag(flags, NetPermissionFlags::Implicit);
    BOOST_CHECK(!NetPermissions::HasFlag(flags, NetPermissionFlags::Implicit));
}

BOOST_AUTO_TEST_CASE(to_strings_none)
{
    auto strings = NetPermissions::ToStrings(NetPermissionFlags::None);
    BOOST_CHECK(strings.empty());
}

BOOST_AUTO_TEST_CASE(to_strings_individual)
{
    auto strings = NetPermissions::ToStrings(NetPermissionFlags::BloomFilter);
    BOOST_CHECK_EQUAL(strings.size(), 1U);
    BOOST_CHECK_EQUAL(strings[0], "bloomfilter");

    strings = NetPermissions::ToStrings(NetPermissionFlags::Mempool);
    BOOST_CHECK_EQUAL(strings.size(), 1U);
    BOOST_CHECK_EQUAL(strings[0], "mempool");

    strings = NetPermissions::ToStrings(NetPermissionFlags::Addr);
    BOOST_CHECK_EQUAL(strings.size(), 1U);
    BOOST_CHECK_EQUAL(strings[0], "addr");
}

BOOST_AUTO_TEST_CASE(to_strings_compound)
{
    // ForceRelay implies Relay, so both appear
    auto strings = NetPermissions::ToStrings(NetPermissionFlags::ForceRelay);
    bool has_forcerelay = false, has_relay = false;
    for (const auto& s : strings) {
        if (s == "forcerelay") has_forcerelay = true;
        if (s == "relay") has_relay = true;
    }
    BOOST_CHECK(has_forcerelay);
    BOOST_CHECK(has_relay);

    // NoBan implies Download, so both appear
    strings = NetPermissions::ToStrings(NetPermissionFlags::NoBan);
    bool has_noban = false, has_download = false;
    for (const auto& s : strings) {
        if (s == "noban") has_noban = true;
        if (s == "download") has_download = true;
    }
    BOOST_CHECK(has_noban);
    BOOST_CHECK(has_download);
}

BOOST_AUTO_TEST_CASE(to_strings_all)
{
    auto strings = NetPermissions::ToStrings(NetPermissionFlags::All);
    BOOST_CHECK_EQUAL(strings.size(), 7U);
}

BOOST_AUTO_TEST_CASE(operator_or)
{
    NetPermissionFlags flags = NetPermissionFlags::BloomFilter | NetPermissionFlags::Mempool;
    BOOST_CHECK(NetPermissions::HasFlag(flags, NetPermissionFlags::BloomFilter));
    BOOST_CHECK(NetPermissions::HasFlag(flags, NetPermissionFlags::Mempool));
    BOOST_CHECK(!NetPermissions::HasFlag(flags, NetPermissionFlags::Relay));
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_with_permissions)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    BOOST_CHECK(NetWhitelistPermissions::TryParse("bloomfilter,relay@127.0.0.1", whitelist, direction, error));
    BOOST_CHECK(NetPermissions::HasFlag(whitelist.m_flags, NetPermissionFlags::BloomFilter));
    BOOST_CHECK(NetPermissions::HasFlag(whitelist.m_flags, NetPermissionFlags::Relay));
    BOOST_CHECK(!NetPermissions::HasFlag(whitelist.m_flags, NetPermissionFlags::Implicit));
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_implicit)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    BOOST_CHECK(NetWhitelistPermissions::TryParse("127.0.0.1", whitelist, direction, error));
    BOOST_CHECK(NetPermissions::HasFlag(whitelist.m_flags, NetPermissionFlags::Implicit));
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_invalid_permission)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    BOOST_CHECK(!NetWhitelistPermissions::TryParse("invalidperm@127.0.0.1", whitelist, direction, error));
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_all)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    BOOST_CHECK(NetWhitelistPermissions::TryParse("all@127.0.0.1", whitelist, direction, error));
    BOOST_CHECK(NetPermissions::HasFlag(whitelist.m_flags, NetPermissionFlags::All));
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_direction_in)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    BOOST_CHECK(NetWhitelistPermissions::TryParse("in,relay@127.0.0.1", whitelist, direction, error));
    BOOST_CHECK(direction == ConnectionDirection::In);
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_direction_out)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    BOOST_CHECK(NetWhitelistPermissions::TryParse("out,relay@127.0.0.1", whitelist, direction, error));
    BOOST_CHECK(direction == ConnectionDirection::Out);
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_direction_both)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    BOOST_CHECK(NetWhitelistPermissions::TryParse("in,out,relay@127.0.0.1", whitelist, direction, error));
    BOOST_CHECK(direction == ConnectionDirection::Both);
}

BOOST_AUTO_TEST_CASE(whitelist_try_parse_only_direction)
{
    NetWhitelistPermissions whitelist;
    ConnectionDirection direction;
    bilingual_str error;

    // Only specifying direction without permissions should fail
    BOOST_CHECK(!NetWhitelistPermissions::TryParse("in@127.0.0.1", whitelist, direction, error));
}

BOOST_AUTO_TEST_CASE(whitebind_out_not_allowed)
{
    NetWhitebindPermissions whitebind;
    bilingual_str error;

    // Whitebind should not allow "out" direction
    BOOST_CHECK(!NetWhitebindPermissions::TryParse("out,relay@127.0.0.1:8333", whitebind, error));
}

BOOST_AUTO_TEST_CASE(whitebind_try_parse_with_port)
{
    NetWhitebindPermissions whitebind;
    bilingual_str error;

    BOOST_CHECK(NetWhitebindPermissions::TryParse("relay@127.0.0.1:8333", whitebind, error));
    BOOST_CHECK(NetPermissions::HasFlag(whitebind.m_flags, NetPermissionFlags::Relay));
}

BOOST_AUTO_TEST_CASE(whitebind_try_parse_no_port)
{
    NetWhitebindPermissions whitebind;
    bilingual_str error;

    BOOST_CHECK(!NetWhitebindPermissions::TryParse("relay@127.0.0.1", whitebind, error));
}

BOOST_AUTO_TEST_SUITE_END()
