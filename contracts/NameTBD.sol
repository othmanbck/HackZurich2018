pragma solidity ^0.4.24;

contract NameTBD {
  address owner;
  mapping(address => bool) doctors;
  mapping(address => bool) pharmacies;
  uint storedData;

  modifier isOwner() { require(msg.sender == owner); _; }
  modifier isDoctor() { require(doctors[msg.sender]); _; }
  modifier isPharmacy() { require(pharmacies[msg.sender]); _; }

  constructor() public {
    owner = msg.sender;
    // For test purposes:
    addDoctor(0xf17f52151EbEF6C7334FAD080c5704D77216b732);
    addPharmacy(0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef);
  }

  function addDoctor(address doctor) public isOwner() {
    doctors[doctor] = true;
  }

  function removeDoctor(address doctor) public isOwner() {
    doctors[doctor] = false;
  }

  function addPharmacy(address pharmacy) public isOwner() {
    pharmacies[pharmacy] = true;
  }

  function removePharmacy(address pharmacy) public isOwner() {
    pharmacies[pharmacy] = false;
  }

  function set(uint x) public isDoctor() {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }
}