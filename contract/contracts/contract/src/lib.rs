#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct Poll {
    pub id: u32,
    pub question: String,
    pub options: Vec<String>,
    pub votes: Map<u32, u32>,
    pub total_votes: u32,
}

#[contracttype]
enum DataKey {
    PollCounter,
    Polls,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn create_poll(env: Env, question: String, options: Vec<String>) -> u32 {
        let id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::PollCounter)
            .unwrap_or(0);

        let mut votes: Map<u32, u32> = Map::new(&env);
        let mut i = 0u32;
        while i < options.len() {
            votes.set(i, 0);
            i += 1;
        }

        let poll = Poll {
            id,
            question: question.clone(),
            options,
            votes,
            total_votes: 0,
        };

        let mut polls: Vec<Poll> = env
            .storage()
            .instance()
            .get(&DataKey::Polls)
            .unwrap_or_else(|| Vec::new(&env));
        polls.push_back(poll);
        env.storage().instance().set(&DataKey::Polls, &polls);
        env.storage()
            .instance()
            .set(&DataKey::PollCounter, &(id + 1));

        env.events()
            .publish((symbol_short!("new_poll"),), (id, question));
        id
    }

    pub fn vote(env: Env, voter: Address, poll_id: u32, option_index: u32) {
        voter.require_auth();

        let mut polls: Vec<Poll> = env
            .storage()
            .instance()
            .get(&DataKey::Polls)
            .unwrap_or_else(|| Vec::new(&env));
        let poll = polls.get(poll_id).unwrap();
        assert!(option_index < poll.options.len(), "invalid option");

        let mut voters: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&poll_id)
            .unwrap_or_else(|| Map::new(&env));
        assert!(!voters.get(voter.clone()).unwrap_or(false), "already voted");

        voters.set(voter.clone(), true);
        env.storage().persistent().set(&poll_id, &voters);
        env.storage()
            .persistent()
            .extend_ttl(&poll_id, 120960, 241920);

        let mut updated = poll.clone();
        let current = poll.votes.get(option_index).unwrap_or(0);
        updated.votes.set(option_index, current + 1);
        updated.total_votes += 1;

        polls.set(poll_id, updated);
        env.storage().instance().set(&DataKey::Polls, &polls);
    }

    pub fn get_poll(env: Env, poll_id: u32) -> Poll {
        let polls: Vec<Poll> = env
            .storage()
            .instance()
            .get(&DataKey::Polls)
            .unwrap_or_else(|| Vec::new(&env));
        polls.get(poll_id).unwrap_or_else(|| Poll {
            id: 0,
            question: String::from_str(&env, ""),
            options: Vec::new(&env),
            votes: Map::new(&env),
            total_votes: 0,
        })
    }

    pub fn get_all_polls(env: Env) -> Vec<Poll> {
        env.storage()
            .instance()
            .get(&DataKey::Polls)
            .unwrap_or_else(|| Vec::new(&env))
    }
}

mod test;
