// Copyright (c) 2024-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <protocol.h>
#include <test/util/setup_common.h>
#include <uint256.h>

#include <cstdint>
#include <string>
#include <vector>

#include <boost/test/unit_test.hpp>

BOOST_AUTO_TEST_SUITE(protocol_tests)

BOOST_AUTO_TEST_CASE(cmessageheader_get_message_type)
{
    MessageStartChars start{0xf9, 0xbe, 0xb4, 0xd9};
    CMessageHeader hdr(start, "version", 100);
    BOOST_CHECK_EQUAL(hdr.GetMessageType(), "version");
    BOOST_CHECK_EQUAL(hdr.nMessageSize, 100U);
    BOOST_CHECK(hdr.pchMessageStart == start);
}

BOOST_AUTO_TEST_CASE(cmessageheader_short_msg_type)
{
    MessageStartChars start{0xf9, 0xbe, 0xb4, 0xd9};
    CMessageHeader hdr(start, "tx", 50);
    BOOST_CHECK_EQUAL(hdr.GetMessageType(), "tx");
}

BOOST_AUTO_TEST_CASE(cmessageheader_is_valid_msg_type)
{
    MessageStartChars start{0xf9, 0xbe, 0xb4, 0xd9};
    CMessageHeader hdr(start, "version", 100);
    BOOST_CHECK(hdr.IsMessageTypeValid());
}

BOOST_AUTO_TEST_CASE(cmessageheader_is_valid_empty_type)
{
    MessageStartChars start{0xf9, 0xbe, 0xb4, 0xd9};
    CMessageHeader hdr(start, "", 0);
    BOOST_CHECK(hdr.IsMessageTypeValid());
}

BOOST_AUTO_TEST_CASE(cmessageheader_invalid_msg_type)
{
    CMessageHeader hdr;
    // Manually set an invalid message type with a non-zero byte after a null byte
    hdr.m_msg_type[0] = 'a';
    hdr.m_msg_type[1] = '\0';
    hdr.m_msg_type[2] = 'b';
    BOOST_CHECK(!hdr.IsMessageTypeValid());
}

BOOST_AUTO_TEST_CASE(cmessageheader_invalid_control_char)
{
    CMessageHeader hdr;
    hdr.m_msg_type[0] = 0x01; // control character
    BOOST_CHECK(!hdr.IsMessageTypeValid());
}

BOOST_AUTO_TEST_CASE(cinv_default_constructor)
{
    CInv inv;
    BOOST_CHECK_EQUAL(inv.type, 0U);
    BOOST_CHECK(inv.hash.IsNull());
}

BOOST_AUTO_TEST_CASE(cinv_parameterized_constructor)
{
    uint256 hash = uint256::ONE;
    CInv inv(MSG_TX, hash);
    BOOST_CHECK_EQUAL(inv.type, MSG_TX);
    BOOST_CHECK(inv.hash == hash);
}

BOOST_AUTO_TEST_CASE(cinv_is_msg_helpers)
{
    uint256 hash = uint256::ONE;
    BOOST_CHECK(CInv(MSG_TX, hash).IsMsgTx());
    BOOST_CHECK(CInv(MSG_BLOCK, hash).IsMsgBlk());
    BOOST_CHECK(CInv(MSG_WTX, hash).IsMsgWtx());
    BOOST_CHECK(CInv(MSG_FILTERED_BLOCK, hash).IsMsgFilteredBlk());
    BOOST_CHECK(CInv(MSG_CMPCT_BLOCK, hash).IsMsgCmpctBlk());
    BOOST_CHECK(CInv(MSG_WITNESS_BLOCK, hash).IsMsgWitnessBlk());

    BOOST_CHECK(!CInv(MSG_TX, hash).IsMsgBlk());
    BOOST_CHECK(!CInv(MSG_BLOCK, hash).IsMsgTx());
}

BOOST_AUTO_TEST_CASE(cinv_is_gen_msg_helpers)
{
    uint256 hash = uint256::ONE;
    BOOST_CHECK(CInv(MSG_TX, hash).IsGenTxMsg());
    BOOST_CHECK(CInv(MSG_WTX, hash).IsGenTxMsg());
    BOOST_CHECK(CInv(MSG_WITNESS_TX, hash).IsGenTxMsg());
    BOOST_CHECK(!CInv(MSG_BLOCK, hash).IsGenTxMsg());

    BOOST_CHECK(CInv(MSG_BLOCK, hash).IsGenBlkMsg());
    BOOST_CHECK(CInv(MSG_FILTERED_BLOCK, hash).IsGenBlkMsg());
    BOOST_CHECK(CInv(MSG_CMPCT_BLOCK, hash).IsGenBlkMsg());
    BOOST_CHECK(CInv(MSG_WITNESS_BLOCK, hash).IsGenBlkMsg());
    BOOST_CHECK(!CInv(MSG_TX, hash).IsGenBlkMsg());
}

BOOST_AUTO_TEST_CASE(cinv_get_message_type)
{
    uint256 hash{};
    BOOST_CHECK_EQUAL(CInv(MSG_TX, hash).GetMessageType(), "tx");
    BOOST_CHECK_EQUAL(CInv(MSG_BLOCK, hash).GetMessageType(), "block");
    BOOST_CHECK_EQUAL(CInv(MSG_WTX, hash).GetMessageType(), "wtx");
    BOOST_CHECK_EQUAL(CInv(MSG_FILTERED_BLOCK, hash).GetMessageType(), "merkleblock");
    BOOST_CHECK_EQUAL(CInv(MSG_CMPCT_BLOCK, hash).GetMessageType(), "cmpctblock");
}

BOOST_AUTO_TEST_CASE(cinv_get_message_type_witness)
{
    uint256 hash{};
    BOOST_CHECK_EQUAL(CInv(MSG_WITNESS_TX, hash).GetMessageType(), "witness-tx");
    BOOST_CHECK_EQUAL(CInv(MSG_WITNESS_BLOCK, hash).GetMessageType(), "witness-block");
}

BOOST_AUTO_TEST_CASE(cinv_get_message_type_unknown)
{
    uint256 hash{};
    BOOST_CHECK_THROW(CInv(0xFFFF, hash).GetMessageType(), std::out_of_range);
}

BOOST_AUTO_TEST_CASE(cinv_tostring)
{
    uint256 hash = uint256::ONE;
    CInv inv(MSG_TX, hash);
    std::string str = inv.ToString();
    BOOST_CHECK(str.find("tx") != std::string::npos);
    BOOST_CHECK(str.find(hash.ToString()) != std::string::npos);
}

BOOST_AUTO_TEST_CASE(cinv_tostring_unknown)
{
    uint256 hash = uint256::ONE;
    CInv inv(0xFFFF, hash);
    std::string str = inv.ToString();
    BOOST_CHECK(str.find("0x0000ffff") != std::string::npos);
}

BOOST_AUTO_TEST_CASE(cinv_less_than)
{
    uint256 hash1{};
    uint256 hash2 = uint256::ONE;
    BOOST_CHECK(CInv(MSG_TX, hash1) < CInv(MSG_BLOCK, hash1));
    BOOST_CHECK(CInv(MSG_TX, hash1) < CInv(MSG_TX, hash2));
    BOOST_CHECK(!(CInv(MSG_BLOCK, hash1) < CInv(MSG_TX, hash1)));
}

BOOST_AUTO_TEST_CASE(service_flags_to_str)
{
    auto flags = serviceFlagsToStr(NODE_NONE);
    BOOST_CHECK(flags.empty());

    flags = serviceFlagsToStr(NODE_NETWORK);
    BOOST_CHECK_EQUAL(flags.size(), 1U);
    BOOST_CHECK_EQUAL(flags[0], "NETWORK");

    flags = serviceFlagsToStr(NODE_BLOOM);
    BOOST_CHECK_EQUAL(flags.size(), 1U);
    BOOST_CHECK_EQUAL(flags[0], "BLOOM");

    flags = serviceFlagsToStr(NODE_WITNESS);
    BOOST_CHECK_EQUAL(flags.size(), 1U);
    BOOST_CHECK_EQUAL(flags[0], "WITNESS");

    flags = serviceFlagsToStr(NODE_COMPACT_FILTERS);
    BOOST_CHECK_EQUAL(flags.size(), 1U);
    BOOST_CHECK_EQUAL(flags[0], "COMPACT_FILTERS");

    flags = serviceFlagsToStr(NODE_NETWORK_LIMITED);
    BOOST_CHECK_EQUAL(flags.size(), 1U);
    BOOST_CHECK_EQUAL(flags[0], "NETWORK_LIMITED");

    flags = serviceFlagsToStr(NODE_P2P_V2);
    BOOST_CHECK_EQUAL(flags.size(), 1U);
    BOOST_CHECK_EQUAL(flags[0], "P2P_V2");
}

BOOST_AUTO_TEST_CASE(service_flags_to_str_combined)
{
    auto flags = serviceFlagsToStr(NODE_NETWORK | NODE_WITNESS);
    BOOST_CHECK_EQUAL(flags.size(), 2U);
    BOOST_CHECK_EQUAL(flags[0], "NETWORK");
    BOOST_CHECK_EQUAL(flags[1], "WITNESS");
}

BOOST_AUTO_TEST_CASE(service_flags_to_str_unknown)
{
    auto flags = serviceFlagsToStr(1ULL << 15);
    BOOST_CHECK_EQUAL(flags.size(), 1U);
    BOOST_CHECK_EQUAL(flags[0], "UNKNOWN[2^15]");
}

BOOST_AUTO_TEST_CASE(may_have_useful_address_db)
{
    BOOST_CHECK(MayHaveUsefulAddressDB(NODE_NETWORK));
    BOOST_CHECK(MayHaveUsefulAddressDB(NODE_NETWORK_LIMITED));
    BOOST_CHECK(MayHaveUsefulAddressDB(ServiceFlags(NODE_NETWORK | NODE_WITNESS)));
    BOOST_CHECK(!MayHaveUsefulAddressDB(NODE_NONE));
    BOOST_CHECK(!MayHaveUsefulAddressDB(NODE_BLOOM));
}

BOOST_AUTO_TEST_CASE(seeds_service_flags)
{
    ServiceFlags flags = SeedsServiceFlags();
    BOOST_CHECK(flags & NODE_NETWORK);
    BOOST_CHECK(flags & NODE_WITNESS);
    BOOST_CHECK(!(flags & NODE_BLOOM));
}

BOOST_AUTO_TEST_CASE(to_gen_txid)
{
    uint256 hash = uint256::ONE;
    {
        CInv inv(MSG_TX, hash);
        GenTxid gtxid = ToGenTxid(inv);
        BOOST_CHECK(!gtxid.IsWtxid());
        BOOST_CHECK(gtxid.ToUint256() == hash);
    }
    {
        CInv inv(MSG_WTX, hash);
        GenTxid gtxid = ToGenTxid(inv);
        BOOST_CHECK(gtxid.IsWtxid());
        BOOST_CHECK(gtxid.ToUint256() == hash);
    }
}

BOOST_AUTO_TEST_SUITE_END()
