/**
 * how to store token in the client site
 * 1. momory - ok type
 * 2. local storage -- ok type (xss)
 * 3. cookies : http only -- best of three
 */

/**
 * secret token generate 
 * // SECRET KEY GENERATE WAY 60-4 xlass
    // 1). open terminal type node 
    // 2). require('crypto').randomBytes(64).toString('hex')
 */

    /**
     * 1) set cookies with http only. for delvelopment secure : false
     * res
      .cookie('secureCookie', token, {
        httpOnly : true, 
        secure : false, local hoile false, production hoile true
        sameSite : 'none'
      })
      .send('success')


      2) cors
        *app.use(cors({
                origin:['http://localhost:5173/'],
                credentials: true
        }))

      3) client side axios
      *axios.post('http://localhost:5000/jwt', userData, {withCredentials: true})
            .then(res =>{
              console.log(res.data)
            })
     */