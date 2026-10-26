package com.pennyvault.entity;

/**
 * Application roles stored in household_members.member_role.
 * OWNER is the existing database value and represents the Primary Owner.
 */
public enum HouseholdRole {
    OWNER,
    CO_OWNER,
    MEMBER;

    public boolean isPrimaryOwner() {
        return this == OWNER;
    }
}
