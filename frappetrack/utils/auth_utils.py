import frappe

def get_logged_in_user():
    # if frappe.session.user == "Guest":
    #     frappe.throw("Unauthorized", frappe.PermissionError)
    return frappe.session.user

@frappe.whitelist(allow_guest=True)
def get_user_from_token():
    auth = frappe.get_request_header("Authorization")

    if not auth or not auth.startswith("Bearer "):
        frappe.throw("Missing token")

    token = auth.split(" ")[1]

    # Example: token stored as api_key
    user = frappe.db.get_value(
        "User",
        {"api_key": token},
        ["name", "full_name", "email", "user_type"],
        as_dict=True
    )

    if not user:
        frappe.throw("Invalid token")

    return {
        "success": True,
        "user": user
    }
