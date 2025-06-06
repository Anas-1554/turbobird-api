const express = require('express');

/**
 * Create student API handler
 * @param {Object} puppeteerLauncher - The puppeteer launcher instance
 * @returns {Function} Express route handler
 */
function createStudentHandler(puppeteerLauncher) {
    return async (req, res) => {
        try {
            // Validate request method
            if (req.method !== 'POST') {
                return res.status(405).json({
                    success: false,
                    error: 'Method not allowed. Use POST.'
                });
            }

            // Validate required fields
            const {
                firstname,
                lastname,
                email,
                phone,
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                address
            } = req.body;
            
            if (!firstname || !lastname || !parentFirstName || !parentLastName) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields. Please provide firstname, lastname, parentFirstName, and parentLastName.'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid student email format.'
                });
            }
            
            if (parentEmail && !emailRegex.test(parentEmail)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid parent email format.'
                });
            }

            // Get browser page
            const page = puppeteerLauncher.getPage();
            if (!page) {
                return res.status(503).json({
                    success: false,
                    error: 'Browser is not available'
                });
            }

            // Navigate to the student registration URL
            const targetUrl = 'https://app.tutorbird.com/Teacher/v2/en/students/add';
            console.log(`Navigating to: ${targetUrl}`);
            await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Wait for the form to load
            await page.waitForSelector('[data-sb-qa="student-input-first-name"]', { timeout: 10000 });

            // Fill in the first name
            console.log(`Filling first name: ${firstname}`);
            await page.focus('[data-sb-qa="student-input-first-name"]');
            await page.evaluate(() => document.querySelector('[data-sb-qa="student-input-first-name"]').value = '');
            await page.type('[data-sb-qa="student-input-first-name"]', firstname);

            // Fill in the last name
            console.log(`Filling last name: ${lastname}`);
            await page.focus('[data-sb-qa="student-input-last-name"]');
            await page.evaluate(() => document.querySelector('[data-sb-qa="student-input-last-name"]').value = '');
            await page.type('[data-sb-qa="student-input-last-name"]', lastname);

            // Fill in the email (optional)
            if (email) {
                console.log(`Filling email: ${email}`);
                await page.focus('[data-sb-qa="student-input-email"]');
                await page.evaluate(() => document.querySelector('[data-sb-qa="student-input-email"]').value = '');
                await page.type('[data-sb-qa="student-input-email"]', email);
            }

            // Fill in the phone number (optional)
            if (phone) {
                console.log(`Filling phone: ${phone}`);
                await page.focus('[data-sb-qa="student-input-phone"]');
                await page.evaluate(() => document.querySelector('[data-sb-qa="student-input-phone"]').value = '');
                await page.type('[data-sb-qa="student-input-phone"]', phone);
            }

            // Click SMS Capable checkbox for student (by default)
            console.log('Clicking student SMS Capable checkbox');
            try {
                await page.waitForSelector('#mat-mdc-checkbox-1-input', { timeout: 3000 });
                await page.click('#mat-mdc-checkbox-1-input');
            } catch (error) {
                console.log('Student SMS checkbox not found or not clickable');
            }

            // Fill in parent first name
            console.log(`Filling parent first name: ${parentFirstName}`);
            await page.focus('[data-sb-qa="parent-firstname"]');
            await page.evaluate(() => document.querySelector('[data-sb-qa="parent-firstname"]').value = '');
            await page.type('[data-sb-qa="parent-firstname"]', parentFirstName);

            // Fill in parent last name
            console.log(`Filling parent last name: ${parentLastName}`);
            await page.focus('[data-sb-qa="parent-lastname"]');
            await page.evaluate(() => document.querySelector('[data-sb-qa="parent-lastname"]').value = '');
            await page.type('[data-sb-qa="parent-lastname"]', parentLastName);

            // Fill in parent email (optional)
            if (parentEmail) {
                console.log(`Filling parent email: ${parentEmail}`);
                await page.focus('[data-sb-qa="parent-email-address"]');
                await page.evaluate(() => document.querySelector('[data-sb-qa="parent-email-address"]').value = '');
                await page.type('[data-sb-qa="parent-email-address"]', parentEmail);
            }

            // Fill in parent phone (optional)
            if (parentPhone) {
                console.log(`Filling parent phone: ${parentPhone}`);
                await page.focus('[data-sb-qa="parent-phone-number"]');
                await page.evaluate(() => document.querySelector('[data-sb-qa="parent-phone-number"]').value = '');
                await page.type('[data-sb-qa="parent-phone-number"]', parentPhone);
            }

            // Click parent SMS Capable checkbox (by default)
            console.log('Clicking parent SMS Capable checkbox');
            try {
                await page.waitForSelector('#mat-mdc-checkbox-4-input', { timeout: 3000 });
                await page.click('#mat-mdc-checkbox-4-input');
            } catch (error) {
                console.log('Parent SMS checkbox not found or not clickable');
            }

            // Fill in address (optional)
            if (address) {
                console.log(`Filling address: ${address}`);
                try {
                    await page.waitForSelector('#mat-input-7', { timeout: 3000 });
                    await page.focus('#mat-input-7');
                    await page.evaluate(() => document.querySelector('#mat-input-7').value = '');
                    await page.type('#mat-input-7', address);
                } catch (error) {
                    console.log('Address field not found or not fillable');
                }
            }

            // Click Send SMS lesson reminders checkbox (by default)
            console.log('Clicking Send SMS lesson reminders checkbox');
            try {
                await page.waitForSelector('#mat-mdc-checkbox-3-input', { timeout: 3000 });
                await page.click('#mat-mdc-checkbox-3-input');
            } catch (error) {
                console.log('SMS lesson reminders checkbox not found or not clickable');
            }

            // Scroll down to ensure the Next button is visible
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            // Wait for the Next button to be visible
            await page.waitForSelector('[data-sb-qa="next-page-button"]', { timeout: 5000 });

            // Click the Next button
            console.log('Clicking Next button');
            await page.click('[data-sb-qa="next-page-button"]');

            // Wait for navigation or form submission
            await page.waitForTimeout(2000);

            // Get current URL to check if navigation happened
            const currentUrl = page.url();
            
            res.json({
                success: true,
                message: 'Student form submitted successfully',
                data: {
                    firstname,
                    lastname,
                    email,
                    phone,
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    address,
                    currentUrl
                }
            });

        } catch (error) {
            console.error('Error in student creation:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to create student',
                details: error.message
            });
        }
    };
}

module.exports = {
    createStudentHandler
};