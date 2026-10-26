// Pure validation shared with tests. Invitation membership comes from the
// database, never from client-supplied household or primary-contact values.
export function validateRsvp(body, guests, menus) {
  if (
    !body ||
    !Array.isArray(body.guests) ||
    !guests.length ||
    body.guests.length !== guests.length
  )
    return "Respond for every guest on your invitation.";
  const ids = new Set(guests.map((g) => g.guest_id));
  const submittedIds = body.guests.map((g) => g?.guest_id);
  if (
    new Set(submittedIds).size !== ids.size ||
    submittedIds.some((id) => !ids.has(id))
  )
    return "Your guest list has changed. Please find your invitation again.";
  const primary =
    guests.find((g) => g.is_primary_contact)?.guest_id ?? guests[0].guest_id;
  if (body.primary_guest_id && body.primary_guest_id !== primary)
    return "Invalid primary contact.";
  for (const [key, max] of [
    ["email", 254],
    ["phone", 50],
    ["note", 4000],
  ]) {
    if (
      body[key] != null &&
      (typeof body[key] !== "string" || body[key].length > max)
    )
      return "Contact details or notes are too long or invalid.";
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))
    return "Enter a valid email address.";
  const byId = new Map(guests.map((g) => [g.guest_id, g]));
  for (const input of body.guests) {
    const guest = byId.get(input.guest_id);
    if (typeof input.attending_wedding !== "boolean")
      return "Each guest needs a yes/no response.";
    if (guest.invited_rehearsal_dinner) {
      if (typeof input.attending_rehearsal !== "boolean")
        return "Please respond for each rehearsal dinner guest.";
    } else if (input.attending_rehearsal != null)
      return "Rehearsal dinner is limited to invited guests.";
    for (const [key, max] of [
      ["dietary_notes", 2000],
      ["plus_one_name", 200],
      ["meal_preference", 100],
      ["plus_one_type", 20],
    ]) {
      if (
        input[key] != null &&
        (typeof input[key] !== "string" || input[key].length > max)
      )
        return "Guest details are too long or invalid.";
    }
    const placeholder = guest.name_status === "PLACEHOLDER_UNKNOWN";
    if (!placeholder && (input.plus_one_name || input.plus_one_type))
      return "Only unnamed guest seats can be renamed.";
    if (
      input.plus_one_type &&
      !["adult", "child"].includes(input.plus_one_type)
    )
      return "Choose adult or child for your guest.";
    if (
      placeholder &&
      input.attending_wedding &&
      (!input.plus_one_name?.trim() ||
        !["adult", "child"].includes(input.plus_one_type))
    )
      return "Enter the name and adult/child selection for your guest.";
    if (input.attending_wedding && guest.guest_type !== "infant") {
      const child = placeholder
        ? input.plus_one_type === "child"
        : ["child", "toddler"].includes(guest.guest_type);
      const allowed = child ? menus.children : menus.adults;
      if (!allowed.includes(input.meal_preference))
        return "Choose a valid meal for every attending guest.";
      if (
        input.meal_preference === menus.alternative &&
        !input.dietary_notes?.trim()
      )
        return "Please describe your alternative meal or dietary need.";
    }
  }
  return null;
}
