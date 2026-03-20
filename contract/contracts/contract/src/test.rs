#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env, Map, String};

#[test]
fn test_create_and_vote_poll() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    let poll_id = client.create_poll(
        &String::from_str(&env, "Best chain?"),
        &vec![
            &env,
            String::from_str(&env, "Stellar"),
            String::from_str(&env, "Ethereum"),
            String::from_str(&env, "Solana"),
        ],
    );
    assert_eq!(poll_id, 0);

    client.vote(&user1, &0, &0);
    client.vote(&user2, &0, &0);

    let poll = client.get_poll(&0);
    assert_eq!(poll.question, String::from_str(&env, "Best chain?"));
    assert_eq!(poll.options.len(), 3);
    assert_eq!(poll.votes.get(0).unwrap(), 2);
    assert_eq!(poll.votes.get(1).unwrap(), 0);
    assert_eq!(poll.votes.get(2).unwrap(), 0);
    assert_eq!(poll.total_votes, 2);
}

#[test]
fn test_vote_with_options() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    let poll_id = client.create_poll(
        &String::from_str(&env, "Morning coffee?"),
        &vec![
            &env,
            String::from_str(&env, "Espresso"),
            String::from_str(&env, "Latte"),
        ],
    );

    client.vote(&user1, &poll_id, &0);
    client.vote(&user2, &poll_id, &1);
    client.vote(&user3, &poll_id, &0);

    let poll = client.get_poll(&poll_id);
    assert_eq!(poll.votes.get(0).unwrap(), 2);
    assert_eq!(poll.votes.get(1).unwrap(), 1);
    assert_eq!(poll.total_votes, 3);
}

#[test]
#[should_panic(expected = "already voted")]
fn test_cannot_vote_twice() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    client.create_poll(
        &String::from_str(&env, "Test poll"),
        &vec![
            &env,
            String::from_str(&env, "A"),
            String::from_str(&env, "B"),
        ],
    );

    client.vote(&user, &0, &0);
    client.vote(&user, &0, &1); // panic — already voted
}

#[test]
#[should_panic(expected = "invalid option")]
fn test_cannot_vote_invalid_option() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    client.create_poll(
        &String::from_str(&env, "Test poll"),
        &vec![
            &env,
            String::from_str(&env, "A"),
            String::from_str(&env, "B"),
        ],
    );

    client.vote(&user, &0, &5); // panic — option 5 doesn't exist
}

#[test]
fn test_multiple_polls() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    let poll1 = client.create_poll(
        &String::from_str(&env, "Pizza toppings?"),
        &vec![
            &env,
            String::from_str(&env, "Pepperoni"),
            String::from_str(&env, "Mushrooms"),
        ],
    );
    let poll2 = client.create_poll(
        &String::from_str(&env, "Best color?"),
        &vec![
            &env,
            String::from_str(&env, "Blue"),
            String::from_str(&env, "Red"),
            String::from_str(&env, "Green"),
        ],
    );

    assert_eq!(poll1, 0);
    assert_eq!(poll2, 1);

    client.vote(&user1, &poll1, &0);
    client.vote(&user2, &poll2, &2);

    let all_polls = client.get_all_polls();
    assert_eq!(all_polls.len(), 2);

    let p1 = all_polls.get(0).unwrap();
    assert_eq!(p1.votes.get(0).unwrap(), 1);

    let p2 = all_polls.get(1).unwrap();
    assert_eq!(p2.votes.get(2).unwrap(), 1);
}

#[test]
fn test_get_poll_not_found() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let poll = client.get_poll(&99);
    assert_eq!(poll.id, 0);
    assert_eq!(poll.total_votes, 0);
}
