function initPaypalCheckout() {
    if (typeof paypal === "undefined") {
        setTimeout(initPaypalCheckout, 200);
    } else {
        var $wrapper = $('.paypal-rest-form');
        var $form = $wrapper.parents('form');
        var paymentUrl = $wrapper.data('prepare');
        var completeUrl = $wrapper.data('complete');
        var transactionHash;

        paypal.Buttons({
            createOrder: function(data, actions) {
                // Set up the transaction
                var postData = {};
                var $formElements = $form.find('input[type=hidden]');

                for (var i = 0; i < $formElements.length; i++) {
                    if ($formElements[i].name === 'action') {
                        continue;
                    }
                    postData[$formElements[i].name] = $formElements.get(i).value;
                }

                var form = new FormData($form[0]);

                return fetch(paymentUrl, {
                    method: 'post',
                    body: form,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(function(res) {
                    return res.json();
                }).then(function(data) {
                    transactionHash = data.transactionHash;
                    return data.transactionId; // Use the same key name for order ID on the client and server
                });
            },
            onError: function(err) {
                alert(err);
            },
            onApprove: function(data, actions) {
                var form = new FormData();
                form.append('commerceTransactionHash', transactionHash);

                return fetch(completeUrl, {
                    method: 'post',
                    body: form,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(function(res) {
                    return res.json();
                }).then(function(data) {
                    window.location = data.url;
                });
            }
        }).render('#paypal-button-container');
    }
}

initPaypalCheckout();