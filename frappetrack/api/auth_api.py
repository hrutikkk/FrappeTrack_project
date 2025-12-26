import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def login_custom(username: str, password: str) -> dict:
    """
    Authenticate the user's credentials and return API keys & session.
    Args:
        username (str): Username
        password (str): Password
    Returns:
        dict: JSON with user details and API credentials
    """
    try:
        frappe.flags.disable_csrf = True

        login_manager = frappe.auth.LoginManager()
        login_manager.authenticate(usr=username, pwd=password)
        login_manager.post_login()
        
    except frappe.exceptions.AuthenticationError:
        frappe.clear_messages()
        return {
            "success": False,
            "message": "Authentication Error!"
        }


    api_secret = generate_keys(frappe.session.user)
    user = frappe.get_doc("User", frappe.session.user)

    return {
        "success": True,
        "message": "Authentication successful",
        "api_key": user.api_key,
        "api_secret": user.get_password("api_secret"),
        "username": user.username,
        "email": user.email
    }


def generate_keys(user: str) -> str:
    """
    Generate or refresh API key and secret for the user.
    Args:
        user (str): User ID
    Returns:
        str: api_secret
    """
    user_doc = frappe.get_doc("User", user)

    if not user_doc.api_key:
        user_doc.api_key = frappe.generate_hash(length=15)

    user_doc.api_secret = frappe.generate_hash(length=15)
    user_doc.save(ignore_permissions=True)
    return user_doc.api_secret
