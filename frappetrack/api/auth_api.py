import frappe
from frappe import _

import frappe

# @frappe.whitelist(allow_guest=True)
# def login_custom(username: str, password: str) -> dict:
#     try:
#         login_manager = frappe.auth.LoginManager()
#         login_manager.authenticate(user=username, pwd=password)
#         login_manager.post_login()
#     except frappe.exceptions.AuthenticationError:
#         frappe.clear_messages()
#         return {
#             "success": False,
#             "message": "Invalid username or password"
#         }

#     user = frappe.get_doc("User", frappe.session.user)

#     return {
#         "success": True,
#         "message": "Login successful",
#         "user": {
#             "username": user.username,
#             "email": user.email,
#             "full_name": user.full_name,
#             "sid": frappe.session.sid
#         }
#     }

@frappe.whitelist(allow_guest=True)
def login_custom(username: str, password: str):
    import frappe
    try:
        login_manager = frappe.auth.LoginManager()
        login_manager.authenticate(user=username, pwd=password)
        login_manager.post_login()
    except frappe.exceptions.AuthenticationError:
        frappe.clear_messages()
        # return JSON instead of raising 500
        return {
            "success": False,
            "message": "Invalid username or password"
        }
    except Exception as e:
        frappe.log_error(message=str(e), title="login_custom Error")
        return {
            "success": False,
            "message": f"Unexpected error: {str(e)}"
        }

    user = frappe.get_doc("User", frappe.session.user)

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "sid": frappe.session.sid
        }
    }


@frappe.whitelist()
def whoami():
    return frappe.session.user