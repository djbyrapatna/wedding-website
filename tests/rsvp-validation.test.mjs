import test from "node:test";
import assert from "node:assert/strict";
import { validateRsvp } from "../src/lib/rsvp/validation.mjs";
const menus = {
  adults: ["Beef", "Chicken", "Alternative"],
  children: ["Tenders", "Burger"],
};
const guest = {
  guest_id: "G001",
  is_primary_contact: true,
  guest_type: "adult",
  name_status: "confirmed",
  invited_rehearsal_dinner: false,
};
const response = {
  guest_id: "G001",
  attending_wedding: true,
  attending_rehearsal: null,
  meal_preference: "Beef",
  plus_one_name: null,
  plus_one_type: null,
};
const check = (overrides = {}, guests = [guest]) =>
  validateRsvp({ guests: [{ ...response, ...overrides }] }, guests, menus);
test("RSVP validation rejects malformed, duplicate, and cross-household guests", () => {
  assert.ok(validateRsvp(null, [guest], menus));
  assert.ok(validateRsvp({ guests: [null] }, [guest], menus));
  assert.ok(
    validateRsvp(
      { guests: [response, response] },
      [guest, { ...guest, guest_id: "G002" }],
      menus,
    ),
  );
  assert.ok(check({ guest_id: "G999" }));
  assert.ok(check({ attending_wedding: "yes" }));
  assert.ok(
    validateRsvp(
      { primary_guest_id: "G999", guests: [response] },
      [guest],
      menus,
    ),
  );
});
test("RSVP validation enforces menu and rehearsal eligibility", () => {
  assert.equal(check(), null);
  assert.ok(check({ meal_preference: null }));
  assert.ok(check({ attending_rehearsal: true }));
  assert.ok(check({}, [{ ...guest, invited_rehearsal_dinner: true }]));
  assert.equal(
    check({ attending_rehearsal: false }, [
      { ...guest, invited_rehearsal_dinner: true },
    ]),
    null,
  );
  assert.equal(
    check({ attending_wedding: false, meal_preference: null }),
    null,
  );
  assert.equal(
    check({ meal_preference: null }, [{ ...guest, guest_type: "infant" }]),
    null,
  );
  assert.ok(
    check({ meal_preference: "Beef" }, [{ ...guest, guest_type: "child" }]),
  );
  assert.equal(
    check({ meal_preference: "Tenders" }, [
      { ...guest, guest_type: "toddler" },
    ]),
    null,
  );
});
test("RSVP validation handles unnamed seats and bounds free text", () => {
  const placeholder = [{ ...guest, name_status: "PLACEHOLDER_UNKNOWN" }];
  assert.ok(check({}, placeholder));
  assert.ok(
    check({ plus_one_name: "Guest", plus_one_type: "dog" }, placeholder),
  );
  assert.equal(
    check({ plus_one_name: "Guest", plus_one_type: "adult" }, placeholder),
    null,
  );
  assert.equal(
    check(
      {
        plus_one_name: "Child",
        plus_one_type: "child",
        meal_preference: "Tenders",
      },
      placeholder,
    ),
    null,
  );
  assert.ok(check({ plus_one_name: "Renamed known guest" }));
  assert.ok(check({ dietary_notes: "x".repeat(2001) }));
});
