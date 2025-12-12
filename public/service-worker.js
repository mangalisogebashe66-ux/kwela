self.addEventListener("push", function (event) {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/khwela-logo.png",
      badge: "/khwela-logo.png",
    })
  );
});
