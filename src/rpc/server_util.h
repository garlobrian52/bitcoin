// Copyright (c) 2021-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifndef BITCOIN_RPC_SERVER_UTIL_H
#define BITCOIN_RPC_SERVER_UTIL_H

#include <any>

#include <consensus/params.h>
#include <kernel/cs_main.h>
#include <uint256.h>

class AddrMan;
class ArgsManager;
class CBlockIndex;
class CBlockPolicyEstimator;
class CConnman;
class CTxMemPool;
class ChainstateManager;
class PeerManager;
class BanMan;
namespace node {
class BlockManager;
struct NodeContext;
} // namespace node
namespace interfaces {
class Mining;
} // namespace interfaces

node::NodeContext& EnsureAnyNodeContext(const std::any& context);
CTxMemPool& EnsureMemPool(const node::NodeContext& node);
CTxMemPool& EnsureAnyMemPool(const std::any& context);
BanMan& EnsureBanman(const node::NodeContext& node);
BanMan& EnsureAnyBanman(const std::any& context);
ArgsManager& EnsureArgsman(const node::NodeContext& node);
ArgsManager& EnsureAnyArgsman(const std::any& context);
ChainstateManager& EnsureChainman(const node::NodeContext& node);
ChainstateManager& EnsureAnyChainman(const std::any& context);
CBlockPolicyEstimator& EnsureFeeEstimator(const node::NodeContext& node);
CBlockPolicyEstimator& EnsureAnyFeeEstimator(const std::any& context);
CConnman& EnsureConnman(const node::NodeContext& node);
interfaces::Mining& EnsureMining(const node::NodeContext& node);
PeerManager& EnsurePeerman(const node::NodeContext& node);
AddrMan& EnsureAddrman(const node::NodeContext& node);
AddrMan& EnsureAnyAddrman(const std::any& context);

/**
 * Look up a block index by hash, throwing JSONRPCError if not found.
 * Caller must hold cs_main.
 */
const CBlockIndex& EnsureBlockIndex(const node::BlockManager& blockman, const uint256& hash) EXCLUSIVE_LOCKS_REQUIRED(::cs_main);
CBlockIndex& EnsureBlockIndex(node::BlockManager& blockman, const uint256& hash) EXCLUSIVE_LOCKS_REQUIRED(::cs_main);

/** Return an empty block index on top of the tip, with height, time and nBits set */
void NextEmptyBlockIndex(CBlockIndex& tip, const Consensus::Params& consensusParams, CBlockIndex& next_index);

#endif // BITCOIN_RPC_SERVER_UTIL_H
