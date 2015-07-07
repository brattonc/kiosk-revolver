# kiosk-revolver
A chrome extension for interactive kiosks.

This extension periodically loads new tabs with given URLs and has various options for locking down Chrome to prevent users from escaping the browser, while still allowing them to interact with loaded pages. Note that there is no way to prevent the user form closing the browser or browsing to other sites via an extension, to truly lock down the browser other access controls are needed as well:

  - [Chrome windows group policies](https://support.google.com/chrome/a/answer/187202?hl=en). This can be used to disable various options in Chrome and disable access to the settings page by blacklisting the chrome:// URL.
  - [Windows 8 Assigned Access](http://blogs.technet.com/b/askpfeplat/archive/2013/10/28/how-to-setup-assigned-access-in-windows-8-1-kiosk-mode.aspx). Allows a windows user to be configured so that they can only run a single application and have no desktop access.

This extension is based on the [Revolver - Tabs](https://code.google.com/p/revolver-chrome-extensions/) extension by [Ben Hedrington](http://www.buildcontext.com/). With icons from [icons8.com](http://icons8.com/web-app/758/One-Finger).
